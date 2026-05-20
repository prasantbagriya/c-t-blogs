import { setDoc, getCollection, addDoc } from '../db.js';
import { processInstagramMessage } from '../flowEngine.js';
import { detectScam } from '../ai.js';
import { META_APP_ID, META_APP_SECRET, META_API_VERSION } from '../config.js';

export const exchangeCode = async (req, res) => {
  try {
    const { code, accessToken: directToken, uid, redirectUri } = req.body;
    
    if (!uid) {
      console.error('[Instagram Connect] Missing UID in request body.');
      return res.status(400).json({ error: 'Code and UID are required' });
    }

    const appId = META_APP_ID || '1464713225364837';
    const appSecret = META_APP_SECRET || '6f42865358fc672762f088023f1a77f2';
    
    const finalRedirectUri = redirectUri || `https://${req.get('host')}/instagram-callback`;

    console.log(`[Instagram Connect] Processing for user: ${uid} | code: ${!!code} | directToken: ${!!directToken}`);
    
    // Prefer directToken (already an access token from FB SDK) over code
    let rawInput = typeof directToken === 'string' ? directToken.trim() : (typeof code === 'string' ? code.trim() : '');

    if (!rawInput) {
      console.error('[Instagram Connect] No auth code or access token in request body.');
      return res.status(400).json({ error: 'Code and UID are required' });
    }

    let accessToken = '';

    // Detect if this is already a valid access token (starts with EAA and is long) 
    // or a short auth code that needs to be exchanged
    const looksLikeToken = rawInput.startsWith('EA');

    if (looksLikeToken) {
      // Already an access token from FB.login SDK â€” use directly
      console.log('[Instagram Connect] Detected direct access token from FB SDK. Skipping exchange.');
      accessToken = rawInput;
    } else {
      // It's a short auth code â€” exchange it for a token
      console.log('[Instagram Connect] Detected auth code. Exchanging for access token...');
      if (!appSecret) {
        console.error('[Instagram Connect] CRITICAL: META_APP_SECRET is missing in .env');
        return res.status(500).json({ error: 'Server configuration error: Missing App Secret' });
      }

      const exchangeUrl = `https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&client_secret=${appSecret}&code=${rawInput}`;
      
      const exchangeRes = await fetch(exchangeUrl);
      const exchangeData = await exchangeRes.json();

      if (!exchangeRes.ok) {
        console.error('[Instagram Connect] Code exchange failed:', exchangeData);
        return res.status(401).json({ 
          error: exchangeData.error?.message || 'Failed to exchange Instagram code',
          meta_error: exchangeData.error
        });
      }

      accessToken = exchangeData.access_token;
      if (!accessToken) {
        console.error('[Instagram Connect] CRITICAL: Exchange successful but NO access_token in response:', exchangeData);
        return res.status(500).json({ error: 'Meta returned an empty access token. Please try again.' });
      }
      console.log('[Instagram Connect] Token exchange successful.');
    }

    // Step 2: Fetch user profile to verify token
    // IMPORTANT: encodeURIComponent prevents special chars in token from breaking URL
    const meRes = await fetch(`https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
    const meData = await meRes.json();

    if (!meRes.ok) {
      console.error('[Instagram Connect] /me fetch failed:', meData);
      return res.status(500).json({ 
        error: meData.error?.message || 'Failed to verify Instagram profile access',
        meta_error: meData.error
      });
    }

    // Step 3: Fetch Instagram Business Accounts (via Pages)
    console.log('[Instagram Connect] Fetching linked Pages and IG Business Accounts...');
    const pagesRes = await fetch(`https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/me/accounts?fields=name,access_token,instagram_business_account&access_token=${encodeURIComponent(accessToken)}`);
    const pagesData = await pagesRes.json();

    const connectedAccounts = [];

    // DEBUG: Log raw pages data for troubleshooting
    try {
      const fs = await import('fs');
      fs.appendFileSync('flow_debug.log', `\n[IG Connect] Raw Pages Data: ${JSON.stringify(pagesData)}\n`);
    } catch (e) {}

    // Fallback: Check for direct Instagram Business Accounts on the user profile
    // some Creator accounts or specific Business setups appear here first
    let fallbackIgAccounts = [];
    try {
       const igRes = await fetch(`https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/me/instagram_business_accounts?fields=id,username,name&access_token=${encodeURIComponent(accessToken)}`);
       const igData = await igRes.json();
       if (igRes.ok && igData.data) {
         fallbackIgAccounts = igData.data;
         console.log(`[Instagram Connect] Fallback found ${fallbackIgAccounts.length} direct IG accounts.`);
       }
    } catch (e) { console.error('[Instagram Connect] Fallback check failed:', e); }

    if (pagesRes.ok && pagesData.data) {
      console.log(`[Instagram Connect] Found ${pagesData.data.length} Pages. Scanning for IG accounts...`);
      for (const page of pagesData.data) {
        let igId = page.instagram_business_account?.id;
        
        // AGGRESSIVE CHECK: If not in field, try the /instagram_accounts edge
        if (!igId) {
           try {
             const subRes = await fetch(`https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/${page.id}/instagram_accounts?access_token=${encodeURIComponent(page.access_token)}`);
             const subData = await subRes.json();
             if (subRes.ok && subData.data?.length > 0) {
               igId = subData.data[0].id;
               console.log(`[Instagram Connect] Found IG Account ID: ${igId} via AGGRESSIVE secondary check on Page: ${page.name}`);
             }
           } catch (e) {}
        }

        if (igId) {
           console.log(`[Instagram Connect] Found IG Business Account ID: ${igId} on Page: ${page.name}`);
           
           // Fetch comprehensive IG Business account data from Meta Graph API
           const igFields = 'username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count,account_type,is_verified';
           const igRes = await fetch(`https://graph.facebook.com/${META_API_VERSION || 'v22.0'}/${igId}?fields=${igFields}&access_token=${encodeURIComponent(page.access_token)}`);
          const igInfo = await igRes.json();

          if (igRes.ok) {
            const accountId = `ig_${igId}`;

            // â”€â”€ META BUSINESS ACCOUNT LINKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // The accountId is ALWAYS derived from Meta's permanent Instagram
            // Business Account ID, so it stays stable across reconnects.
            // If this account already exists, we UPDATE it (preserving flows)
            // rather than creating a duplicate.
            const existingAccounts = await getCollection('instagram_accounts');
            const existing = existingAccounts.find(a => a.id === accountId);

            const ownerUid = uid; 
            console.log(`[Instagram Connect] Updating/Creating account @${igInfo.username} for uid: ${ownerUid}`);

            const accountData = {
              id: accountId,
              uid: ownerUid,           // preserve original owner's uid
              instagramId: igId,
              // Profile
              username: igInfo.username,
              displayName: igInfo.name,
              biography: igInfo.biography || '',
              website: igInfo.website || '',
              profilePicture: igInfo.profile_picture_url,
              // Stats
              followers_count: igInfo.followers_count || 0,
              follows_count: igInfo.follows_count || 0,
              media_count: igInfo.media_count || 0,
              // Account Meta
              account_type: igInfo.account_type || 'BUSINESS',
              is_verified: igInfo.is_verified || false,
              // Tokens (always refresh to latest)
              accessToken,
              pageAccessToken: page.access_token,
              pageId: page.id,
              pageName: page.name,
              status: 'active',
              source: 'instagram_login',
              connectedAt: existing?.connectedAt || new Date().toISOString(),
              lastSynced: new Date().toISOString(),
              createdAt: existing?.createdAt || new Date().toISOString()
            };

            await setDoc('instagram_accounts', accountId, accountData);
            console.log(`[Instagram Connect] âœ… Saved IG account: @${igInfo.username} | Followers: ${igInfo.followers_count} | Posts: ${igInfo.media_count}`);
            connectedAccounts.push(accountData);
          } else {
            console.warn(`[Instagram Connect] Failed to fetch details for IG ID ${igId}:`, igInfo);
          }
        }
      }
    }

    if (connectedAccounts.length === 0) {
      console.log('[Instagram Connect] No IG accounts, but updating FB token for Page Management.');
      // Use the user's UID as the primary ID to ensure we overwrite any old/invalid tokens
      await setDoc('instagram_accounts', uid, {
        id: uid,
        uid: uid,
        accessToken,
        status: 'active',
        source: 'facebook_link',
        lastSynced: new Date().toISOString()
      });
    }

    res.json({ success: true, accounts: connectedAccounts, message: connectedAccounts.length > 0 ? 'Accounts connected' : 'Facebook linked' });

  } catch (error) {
    console.error('[Instagram Controller] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deauthorize = async (req, res) => {
  console.log('[Instagram] Deauthorize callback received:', req.body);
  res.json({ success: true, message: 'Deauthorization received' });
};

export const deleteData = async (req, res) => {
  console.log('[Instagram] Data deletion request received:', req.body);
  res.json({ 
    url: 'https://chatwizs.com/data-deletion-status', 
    confirmation_code: 'del-' + Date.now() 
  });
};

export const syncAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === id);

    if (!account) {
      return res.status(404).json({ error: 'Instagram account not found.' });
    }

    const token = account.pageAccessToken || account.accessToken;
    if (!token) {
      return res.status(400).json({ error: 'No access token found for this account. Please reconnect.' });
    }

    const igId = account.instagramId;
    const META_API_VERSION = process.env.META_API_VERSION || 'v22.0';

    console.log(`[Instagram Sync] Refreshing data for account: ${account.username} (${igId})`);

    const igFields = 'username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count,account_type,is_verified';
    const igRes = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${igId}?fields=${igFields}&access_token=${encodeURIComponent(token)}`);
    const igInfo = await igRes.json();

    if (!igRes.ok) {
      console.error('[Instagram Sync] Meta API error:', igInfo);
      return res.status(502).json({ 
        error: igInfo.error?.message || 'Failed to sync from Meta. Token may have expired.',
        meta_error: igInfo.error 
      });
    }

    const updatedAccount = {
      ...account,
      username: igInfo.username || account.username,
      displayName: igInfo.name || account.displayName,
      biography: igInfo.biography || account.biography || '',
      website: igInfo.website || account.website || '',
      profilePicture: igInfo.profile_picture_url || account.profilePicture,
      followers_count: igInfo.followers_count ?? account.followers_count ?? 0,
      follows_count: igInfo.follows_count ?? account.follows_count ?? 0,
      media_count: igInfo.media_count ?? account.media_count ?? 0,
      is_verified: igInfo.is_verified ?? account.is_verified ?? false,
      lastSynced: new Date().toISOString()
    };

    await setDoc('instagram_accounts', id, updatedAccount);
    console.log(`[Instagram Sync] âœ… Account @${updatedAccount.username} synced successfully.`);

    res.json({ success: true, account: updatedAccount });

  } catch (error) {
    console.error('[Instagram Sync] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'chatwiz_secure_token_2026';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Instagram Webhook] VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
};

export const handleWebhookEvents = async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'instagram') {
      for (const entry of body.entry || []) {
        // â”€â”€ 1. HANDLE DIRECT MESSAGES (messaging) â”€â”€
        if (entry.messaging) {
          const msg = entry.messaging[0];
          const senderId = msg.sender?.id;
          const recipientId = msg.recipient?.id;
          const text = msg.message?.text;
          const quickReply = msg.message?.quick_reply;
          const attachments = msg.message?.attachments;
          const postback = msg.postback;

          if (senderId && recipientId && (text || quickReply || attachments || postback)) {
            const accounts = await getCollection('instagram_accounts');
            const account = accounts.find(acc => acc.instagramId === recipientId);

            if (account) {
              const incomingMsg = {
                uid: account.uid,
                from: senderId,
                sender: 'visitor',
                senderName: 'Instagram User',
                text: text || postback?.title || '',
                interactiveId: quickReply?.payload || postback?.payload || null,
                source: 'instagram',
                instagramAccountId: account.id,
                chatId: senderId,
                timestamp: new Date().toISOString(),
                attachments: attachments || []
              };
              if (attachments?.[0]?.type === 'image' && !incomingMsg.text) incomingMsg.text = '[Image Attachment]';
              await addDoc('messages', incomingMsg);
              processInstagramMessage(incomingMsg, account).catch(err => console.error('[IG-Flow] DM Error:', err));
            }
          }
        }

        // â”€â”€ 2. HANDLE COMMENTS (changes) â”€â”€
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments' && change.value?.from) {
              const { value } = change;
              const senderId = value.from.id;
              const text = value.text;
              const mediaId = value.media?.id;
              const instagramId = entry.id; // Root entry ID is the IG User ID for changes

              const accounts = await getCollection('instagram_accounts');
              const account = accounts.find(acc => acc.instagramId === instagramId);

              if (account && value.verb !== 'remove') {
                // 1. SCAM DETECTION
                const isScam = await detectScam(text || '');
                if (isScam) {
                  console.log(`[Instagram Webhook] ðŸ›¡ï¸ SCAM Detected in IG comment: "${text}"`);
                  await addDoc('instagram_spam', {
                    accountId: account.id,
                    commentId: value.id,
                    mediaId: mediaId,
                    username: value.from.username || 'unknown',
                    text: text || '',
                    matched_keyword: 'AI_SCAM_DETECTOR',
                    timestamp: new Date().toISOString(),
                    uid: account.uid
                  });
                  // Optionally hide the comment via API if it's a scam
                  // await hideCommentInternal(value.id, account.pageAccessToken);
                }

                const incomingComment = {
                  uid: account.uid,
                  from: senderId,
                  sender: 'visitor',
                  senderName: value.from.username || 'IG Commenter',
                  text: text || '',
                  source: 'instagram',
                  instagramAccountId: account.id,
                  chatId: mediaId || senderId, // Group by post (mediaId)
                  mediaId: mediaId,
                  commentId: value.id,
                  timestamp: new Date().toISOString(),
                  isComment: true,
                  isScam
                };
                await addDoc('messages', incomingComment);
                processInstagramMessage(incomingComment, account).catch(err => console.error('[IG-Flow] Comment Error:', err));
              }
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    res.sendStatus(404);
  } catch (error) {
    console.error('[Instagram Webhook] Error:', error);
    res.sendStatus(500);
  }
};

export const publishContent = async (req, res) => {
  try {
    const { accountId, type, caption } = req.body;
    const file = req.file;

    if (!accountId) return res.status(400).json({ error: 'accountId is required.' });
    if (!file) return res.status(400).json({ error: 'No media file uploaded.' });
    if (!caption?.trim()) return res.status(400).json({ error: 'Caption is required.' });

    // Load account from DB
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Instagram account not found.' });

    const token = account.pageAccessToken || account.accessToken;
    if (!token) return res.status(400).json({ error: 'No access token. Please reconnect Instagram.' });

    const igId = account.instagramId;
    const apiVersion = META_API_VERSION || 'v22.0';

    // Build publicly accessible URL for the uploaded file
    // The file is saved by multer to public/uploads/
    const baseUrl = process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const mediaUrl = `${baseUrl}/uploads/${file.filename}`;
    const isVideo = file.mimetype.startsWith('video/');
    const contentType = type || (isVideo ? 'reel' : 'post');

    console.log(`[Instagram Publish] Account: @${account.username} | Type: ${contentType} | Media: ${mediaUrl}`);

    // Step 1: Create Media Container on Instagram
    const containerParams = new URLSearchParams({
      caption,
      access_token: token
    });

    if (contentType === 'reel') {
      containerParams.append('media_type', 'REELS');
      containerParams.append('video_url', mediaUrl);
      containerParams.append('share_to_feed', 'true');
    } else if (contentType === 'story') {
      if (isVideo) {
        containerParams.append('media_type', 'VIDEO');
        containerParams.append('video_url', mediaUrl);
      } else {
        containerParams.append('image_url', mediaUrl);
      }
    } else {
      // Post (image)
      containerParams.append('image_url', mediaUrl);
    }

    const containerRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${igId}/media`,
      { method: 'POST', body: containerParams }
    );
    const containerData = await containerRes.json();

    if (!containerRes.ok || !containerData.id) {
      console.error('[Instagram Publish] Container creation failed:', containerData);
      return res.status(502).json({
        error: containerData.error?.message || 'Failed to create media container on Instagram.',
        meta_error: containerData.error
      });
    }

    const containerId = containerData.id;
    console.log(`[Instagram Publish] Container created: ${containerId}`);

    // Step 2: For videos/reels, poll until container status is FINISHED
    if (isVideo || contentType === 'reel') {
      let attempts = 0;
      let status = 'IN_PROGRESS';
      while (status !== 'FINISHED' && attempts < 20) {
        await new Promise(r => setTimeout(r, 3000)); // wait 3s between polls
        const pollRes = await fetch(
          `https://graph.facebook.com/${apiVersion}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`
        );
        const pollData = await pollRes.json();
        status = pollData.status_code || 'IN_PROGRESS';
        console.log(`[Instagram Publish] Container status (${attempts + 1}): ${status}`);
        attempts++;
        if (status === 'ERROR') {
          return res.status(502).json({ error: 'Instagram failed to process the video. Please try a different file.' });
        }
      }
      if (status !== 'FINISHED') {
        return res.status(504).json({ error: 'Video processing timed out. Please try again.' });
      }
    }

    // Step 3: Publish the container
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: token
    });

    const publishRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${igId}/media_publish`,
      { method: 'POST', body: publishParams }
    );
    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      console.error('[Instagram Publish] Publish failed:', publishData);
      return res.status(502).json({
        error: publishData.error?.message || 'Failed to publish content to Instagram.',
        meta_error: publishData.error
      });
    }

    console.log(`[Instagram Publish] âœ… Published! Post ID: ${publishData.id}`);

    res.json({
      success: true,
      postId: publishData.id,
      message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} published to @${account.username} successfully!`
    });

  } catch (error) {
    console.error('[Instagram Publish] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ GET RECENT POSTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getPosts = async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const igId = account.instagramId;
    const apiV = META_API_VERSION || 'v22.0';

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    const mediaRes = await fetch(
      `https://graph.facebook.com/${apiV}/${igId}/media?fields=${fields}&limit=30&access_token=${encodeURIComponent(token)}`
    );
    const mediaData = await mediaRes.json();

    if (!mediaRes.ok) {
      return res.status(502).json({ error: mediaData.error?.message || 'Failed to fetch posts' });
    }

    res.json({ posts: mediaData.data || [] });
  } catch (error) {
    console.error('[Instagram getPosts] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ GET COMMENTS FOR A POST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getComments = async (req, res) => {
  try {
    const { accountId, postId } = req.query;
    if (!accountId || !postId) return res.status(400).json({ error: 'accountId and postId required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const apiV = META_API_VERSION || 'v22.0';

    const fields = 'id,text,username,timestamp,like_count,hidden,replies{id,text,username,timestamp}';
    const commentsRes = await fetch(
      `https://graph.facebook.com/${apiV}/${postId}/comments?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`
    );
    const commentsData = await commentsRes.json();

    if (!commentsRes.ok) {
      return res.status(502).json({ error: commentsData.error?.message || 'Failed to fetch comments' });
    }

    res.json({ comments: commentsData.data || [] });
  } catch (error) {
    console.error('[Instagram getComments] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ REPLY TO COMMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const replyToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, message } = req.body;

    if (!accountId || !message) return res.status(400).json({ error: 'accountId and message required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const apiV = META_API_VERSION || 'v22.0';

    const params = new URLSearchParams({ message, access_token: token });
    const replyRes = await fetch(`https://graph.facebook.com/${apiV}/${id}/replies`, {
      method: 'POST',
      body: params
    });
    const replyData = await replyRes.json();

    if (!replyRes.ok) {
      return res.status(502).json({ error: replyData.error?.message || 'Reply failed' });
    }

    res.json({ success: true, id: replyData.id });
  } catch (error) {
    console.error('[Instagram replyToComment] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ DELETE COMMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId } = req.body;

    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const apiV = META_API_VERSION || 'v22.0';

    const delRes = await fetch(
      `https://graph.facebook.com/${apiV}/${id}?access_token=${encodeURIComponent(token)}`,
      { method: 'DELETE' }
    );
    const delData = await delRes.json();

    if (!delRes.ok) {
      return res.status(502).json({ error: delData.error?.message || 'Delete failed' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Instagram deleteComment] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ HIDE / UNHIDE COMMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const hideComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, hidden } = req.body;

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const apiV = META_API_VERSION || 'v22.0';

    const params = new URLSearchParams({ hide: String(hidden), access_token: token });
    const hideRes = await fetch(`https://graph.facebook.com/${apiV}/${id}`, {
      method: 'POST',
      body: params
    });
    const hideData = await hideRes.json();

    if (!hideRes.ok) {
      return res.status(502).json({ error: hideData.error?.message || 'Hide action failed' });
    }

    res.json({ success: true, hidden });
  } catch (error) {
    console.error('[Instagram hideComment] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ GET ANALYTICS (Meta Insights API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAnalytics = async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const igId = account.instagramId;
    const apiV = META_API_VERSION || 'v22.0';

    // Fetch account-level insights
    const insightMetrics = 'reach,impressions,profile_views,website_clicks,email_contacts,phone_call_clicks,follower_count';
    const insightsRes = await fetch(
      `https://graph.facebook.com/${apiV}/${igId}/insights?metric=${insightMetrics}&period=day&since=${Math.floor((Date.now() - 7 * 24 * 3600 * 1000) / 1000)}&until=${Math.floor(Date.now() / 1000)}&access_token=${encodeURIComponent(token)}`
    );
    const insightsData = await insightsRes.json();

    // Fetch recent media with stats
    const mediaFields = 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count';
    const mediaRes = await fetch(
      `https://graph.facebook.com/${apiV}/${igId}/media?fields=${mediaFields}&limit=12&access_token=${encodeURIComponent(token)}`
    );
    const mediaData = await mediaRes.json();

    // Process insights into flat object
    const insights = {};
    const reachByDay = [];

    if (insightsData.data) {
      for (const metric of insightsData.data) {
        if (metric.name === 'reach' && metric.values?.length > 0) {
          // Build chart data from daily values
          metric.values.forEach((v, i) => {
            const day = new Date(v.end_time);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            if (reachByDay[i]) {
              reachByDay[i].reach = v.value;
            } else {
              reachByDay.push({ name: dayName, reach: v.value, impressions: 0 });
            }
          });
          insights.reach = metric.values.reduce((sum, v) => sum + v.value, 0);
        } else if (metric.name === 'impressions' && metric.values?.length > 0) {
          metric.values.forEach((v, i) => {
            if (reachByDay[i]) reachByDay[i].impressions = v.value;
          });
          insights.impressions = metric.values.reduce((sum, v) => sum + v.value, 0);
        } else if (metric.values?.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1]?.value || 0;
        }
      }
    }

    res.json({
      insights,
      reachByDay,
      media: mediaData.data || []
    });
  } catch (error) {
    console.error('[Instagram getAnalytics] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ SCHEDULE A POST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const schedulePost = async (req, res) => {
  try {
    const { accountId, caption, type, scheduledAt } = req.body;
    const file = req.file;

    if (!accountId || !caption || !scheduledAt) {
      return res.status(400).json({ error: 'accountId, caption, and scheduledAt are required' });
    }
    if (!file) return res.status(400).json({ error: 'Media file required' });

    const scheduledTime = new Date(scheduledAt);
    if (scheduledTime <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const baseUrl = process.env.VITE_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const mediaUrl = `${baseUrl}/uploads/${file.filename}`;

    const item = {
      accountId,
      caption,
      type: type || 'post',
      scheduledAt: scheduledTime.toISOString(),
      mediaUrl,
      mediaFilename: file.filename,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const saved = await addDoc('instagram_scheduled', item);
    console.log(`[Instagram Schedule] âœ… Post scheduled for: ${scheduledTime.toISOString()}`);

    res.json({ success: true, id: saved.id, scheduledAt: item.scheduledAt });
  } catch (error) {
    console.error('[Instagram schedulePost] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ GET SCHEDULED POSTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getScheduled = async (req, res) => {
  try {
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    const all = await getCollection('instagram_scheduled');
    const items = all
      .filter(s => s.accountId === accountId)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    res.json({ items });
  } catch (error) {
    console.error('[Instagram getScheduled] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ CANCEL SCHEDULED POST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const cancelScheduled = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getCollection('instagram_scheduled').then(all => all.find(s => s.id === id));

    if (!item || item.status === 'published') {
      return res.status(400).json({ error: 'Cannot cancel this post' });
    }

    const { deleteDoc } = await import('../db.js');
    await deleteDoc('instagram_scheduled', id);

    res.json({ success: true });
  } catch (error) {
    console.error('[Instagram cancelScheduled] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ DISCONNECT ACCOUNT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const disconnectAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const { deleteDoc } = await import('../db.js');
    await deleteDoc('instagram_accounts', id);

    console.log(`[Instagram] ðŸ”Œ Disconnected account: @${account.username}`);
    res.json({ success: true, message: `@${account.username} disconnected successfully` });
  } catch (error) {
    console.error('[Instagram disconnectAccount] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// â”€â”€ OPTIMIZE PROFILE (AI SEO) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const optimizeProfile = async (req, res) => {
  try {
    const { accountId } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.pageAccessToken || account.accessToken;
    const igId = account.instagramId;
    const apiV = META_API_VERSION || 'v22.0';

    // 1. Get current profile data for context
    const profileRes = await fetch(
      `https://graph.facebook.com/${apiV}/${igId}?fields=username,biography,followers_count,media_count&access_token=${encodeURIComponent(token)}`
    );
    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      return res.status(502).json({ error: profileData.error?.message || 'Failed to fetch profile' });
    }

    // 2. Call AI for suggestions
    const { suggestProfileOptimization } = await import('../ai.js');
    const suggestions = await suggestProfileOptimization(profileData);

    if (!suggestions) {
      return res.status(500).json({ error: 'AI failed to generate suggestions' });
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('[Instagram optimizeProfile] Error:', error);
    res.status(500).json({ error: error.message });
  }
};



