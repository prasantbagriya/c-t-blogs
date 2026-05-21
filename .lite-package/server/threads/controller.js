import { setDoc, getCollection, addDoc } from '../db.js';
import { THREADS_APP_ID, THREADS_APP_SECRET, THREADS_API_VERSION } from '../config.js';
import { getCleanToken } from '../utils/tokenCleaner.js';

// ── OAUTH: Exchange Code for Access Token ────────────────────────────────────
export const exchangeCode = async (req, res) => {
  try {
    const { code, uid, redirectUri } = req.body;
    
    if (!code || !uid) {
      return res.status(400).json({ error: 'Code and UID are required' });
    }

    console.log(`[Threads Auth] Exchanging Code. RedirectURI: ${redirectUri}, ClientID: ${THREADS_APP_ID}`);

    if (!THREADS_APP_SECRET) {
      console.error('[Threads Auth] THREADS_APP_SECRET is not configured in .env');
      return res.status(500).json({ error: 'Server configuration error: Missing Threads App Secret' });
    }

    // 1. Get Short-Lived Token
    const tokenRes = await fetch(
      `https://graph.threads.net/oauth/access_token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          client_id: THREADS_APP_ID,
          client_secret: THREADS_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code
        })
      }
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('[Threads Auth] Token Exchange Failed. Raw Response:', tokenData);
      const metaError = tokenData.error_message || tokenData.error?.message || 'Unknown Meta Error';
      const metaCode = tokenData.error_code || tokenData.error?.code || 'N/A';
      return res.status(502).json({ 
        error: `Meta Error [${metaCode}]: ${metaError}`,
        raw: tokenData
      });
    }

    const shortToken = tokenData.access_token;
    const threadsUserId = tokenData.user_id;

    // 2. Get Long-Lived Token (60 days)
    const longLivedParams = new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: THREADS_APP_SECRET,
      access_token: shortToken
    });
    
    const longLivedRes = await fetch(
      `https://graph.threads.net/access_token?${longLivedParams.toString()}`
    );
    const longLivedData = await longLivedRes.json();
    if (!longLivedRes.ok) {
      console.error('[Threads Auth] Long-Lived Token Exchange Failed:', longLivedData);
      const msg = longLivedData.error_message || longLivedData.error?.message || 'Failed to get long-lived token';
      return res.status(502).json({ error: `Meta Error (Long-Lived): ${msg}` });
    }
    const accessToken = longLivedData.access_token;

    // 3. Fetch User Profile
    const profileRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/me?fields=id,username,threads_profile_picture_url,threads_biography,follower_count&access_token=${getCleanToken(accessToken)}`
    );
    const profile = await profileRes.json();

    console.log('[Threads Auth] Profile Fetched:', profile.username);

    if (!profile.id || !profile.username) {
      console.error('[Threads Auth] Incomplete Profile Data:', profile);
      return res.status(502).json({ error: 'Failed to fetch complete Threads profile' });
    }

    const account = {
      id: `threads_${threadsUserId}`,
      uid,
      threadsId: threadsUserId,
      username: profile.username,
      displayName: profile.username,
      profilePicture: profile.threads_profile_picture_url || '',
      biography: profile.threads_biography || '',
      followerCount: profile.follower_count || 0,
      accessToken,
      platform: 'threads',
      status: 'active',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[Threads Auth] Saving Account to DB:', account.id);
    await setDoc('threads_accounts', account.id, account);
    console.log('[Threads Auth] Save Successful');

    res.json({ success: true, account });
  } catch (error) {
    console.error('[Threads Auth] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── GET PROFILE ──────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const { accountId } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    // Clean token just in case
    const accessToken = (account.accessToken || '').toString().trim().replace(/["']/g, '');
    if (!accessToken) return res.status(400).json({ error: 'Invalid access token' });

    const profileRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/me?fields=id,username,threads_profile_picture_url,threads_biography,follower_count&access_token=${getCleanToken(accessToken)}`
    );
    const profile = await profileRes.json();
    
    if (!profileRes.ok) {
      console.error('[Threads Profile] Fetch Failed:', profile);
    } else {
      console.log('[Threads Profile] Meta Response for @', profile.username, ':', profile);
    }

    // Fetch Insights as well
    const stats = {};
    try {
      const metrics = 'views,likes,replies,reposts,quotes';
      const insightsRes = await fetch(
        `https://graph.threads.net/${THREADS_API_VERSION}/me/threads_insights?metric=${metrics}&access_token=${getCleanToken(accessToken)}`
      );
      const insights = await insightsRes.json();
      
      if (insightsRes.ok && insights.data) {
        insights.data.forEach(metric => {
          const total = metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
          stats[metric.name] = total;
        });
        console.log('[Threads Insights] Fetched successfully');
      } else {
        console.warn('[Threads Insights] Failed or empty:', insights);
      }
    } catch (e) {
      console.error('[Threads Insights] Error:', e.message);
    }

    // ── DEEP HISTORICAL AGGREGATION (Up to 500 posts) ──
    const aggregated = { likes: 0, replies: 0, reposts: 0, quotes: 0, post_count: 0 };
    try {
      let currentUrl = `https://graph.threads.net/${THREADS_API_VERSION}/me/threads?fields=like_count,reply_count,repost_count,quote_count&limit=100&access_token=${getCleanToken(account.accessToken)}`;
      let pagesFetched = 0;

      while (currentUrl && pagesFetched < 3) {
        const aggRes = await fetch(currentUrl);
        const aggData = await aggRes.json();
        if (!aggRes.ok) {
          console.warn(`[Threads Aggregation] Page ${pagesFetched + 1} failed:`, aggData);
          break;
        }

        if (aggData.data) {
          aggData.data.forEach(t => {
            aggregated.likes += (t.like_count || 0);
            aggregated.replies += (t.reply_count || 0);
            aggregated.reposts += (t.repost_count || 0);
            aggregated.quotes += (t.quote_count || 0);
            aggregated.post_count++;
          });
        }
        currentUrl = aggData.paging?.next || null;
        pagesFetched++;
      }
      console.log(`[Threads Aggregation] Completed. Posts: ${aggregated.post_count}, Pages: ${pagesFetched}`);
    } catch (e) {
      console.error('[Threads Aggregation] Error:', e);
    }

    // Map Meta fields to our internal format for consistency
    const formattedProfile = {
      ...profile,
      profilePicture: profile.threads_profile_picture_url || account.profilePicture || '',
      biography: profile.threads_biography || account.biography || '',
      follower_count: profile.follower_count || 0
    };

    res.json({ 
      ...formattedProfile, 
      stats, 
      aggregated 
    });
  } catch (error) {
    console.error('[Threads Profile] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { accountId, biography, profilePicture } = req.body;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const params = new URLSearchParams({ access_token: account.accessToken });
    if (biography) params.append('threads_biography', biography);
    if (profilePicture) params.append('threads_profile_picture_url', profilePicture);

    const response = await fetch(`https://graph.threads.net/${THREADS_API_VERSION}/me`, {
      method: 'POST',
      body: params
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getThreads = async (req, res) => {
  try {
    const { accountId, after } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    console.log(`[Threads Feed] Fetching for account: ${account.username} (${account.id})`);

    const fields = 'id,media_product_type,media_type,media_url,permalink,timestamp,username,text,is_quote_post,like_count,reply_count,repost_count,quote_count,has_replies,root_id,shortcode,thumbnail_url,children{id,media_url,media_type}';
    let url = `https://graph.threads.net/${THREADS_API_VERSION}/me/threads?fields=${fields}&limit=100&access_token=${getCleanToken(account.accessToken)}`;
    if (after) url += `&after=${after}`;

    const threadsRes = await fetch(url);
    const threadsData = await threadsRes.json();
    console.log('[Threads Feed] Meta Response length:', threadsData.data?.length || 0);

    if (!threadsRes.ok) {
      console.error('[Threads Feed] API Error:', threadsData);
      return res.status(threadsRes.status).json({ 
        error: threadsData.error?.message || 'Failed to fetch threads from Meta',
        raw: threadsData
      });
    }

    res.json({ 
      threads: threadsData.data || [], 
      paging: threadsData.paging || null 
    });
  } catch (error) {
    console.error('[Threads Feed] Critical Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── PUBLISH POST ─────────────────────────────────────────────────────────────
export const publishPost = async (req, res) => {
  try {
    const { accountId, text, mediaUrl, mediaUrls, mediaType, isCarousel } = req.body;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const token = account.accessToken;
    const apiV = THREADS_API_VERSION;
    const publicUrl = process.env.VITE_APP_URL || `http://${req.headers.host}`;

    const convertUrl = (url) => {
      if (url && url.startsWith('/uploads/')) return `${publicUrl}${url}`;
      return url;
    };

    let creationId = null;

    if (isCarousel && mediaUrls && mediaUrls.length > 0) {
      // ── CAROUSEL PUBLISH ───────────────────────────────────────────────────
      const itemIds = [];
      for (const url of mediaUrls) {
        const finalUrl = convertUrl(url);
        const isVideo = finalUrl.toLowerCase().match(/\.(mp4|mov|webm)$/);
        
        const params = new URLSearchParams({ 
          access_token: token,
          is_carousel_item: 'true'
        });
        
        if (isVideo) {
          params.append('media_type', 'VIDEO');
          params.append('video_url', finalUrl);
        } else {
          params.append('media_type', 'IMAGE');
          params.append('image_url', finalUrl);
        }

        const itemRes = await fetch(`https://graph.threads.net/${apiV}/me/threads`, { method: 'POST', body: params });
        const itemData = await itemRes.json();
        if (!itemRes.ok) throw new Error(itemData.error?.message || 'Failed to create carousel item');
        itemIds.push(itemData.id);
      }

      // Create Carousel Container
      const carouselParams = new URLSearchParams({
        access_token: token,
        media_type: 'CAROUSEL',
        children: itemIds.join(','),
        text: text || ''
      });

      const carouselRes = await fetch(`https://graph.threads.net/${apiV}/me/threads`, { method: 'POST', body: carouselParams });
      const carouselData = await carouselRes.json();
      if (!carouselRes.ok) throw new Error(carouselData.error?.message || 'Failed to create carousel container');
      creationId = carouselData.id;

    } else {
      // ── SINGLE POST (TEXT/IMAGE/VIDEO) ─────────────────────────────────────
      const finalMediaUrl = convertUrl(mediaUrl || (mediaUrls?.[0]));
      const params = new URLSearchParams({ access_token: token });
      if (text) params.append('text', text);
      
      if (finalMediaUrl) {
        const isVideo = mediaType === 'VIDEO' || finalMediaUrl.toLowerCase().match(/\.(mp4|mov|webm)$/);
        if (isVideo) {
          params.append('media_type', 'VIDEO');
          params.append('video_url', finalMediaUrl);
        } else {
          params.append('media_type', 'IMAGE');
          params.append('image_url', finalMediaUrl);
        }
      } else {
        params.append('media_type', 'TEXT');
      }

      const containerRes = await fetch(`https://graph.threads.net/${apiV}/me/threads`, { method: 'POST', body: params });
      const containerData = await containerRes.json();
      if (!containerRes.ok) throw new Error(containerData.error?.message || 'Failed to create container');
      creationId = containerData.id;
    }

    // Wait for processing (Simple loop for all types to be safe)
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status !== 'FINISHED' && attempts < 20) {
       await new Promise(r => setTimeout(r, 3000));
       const statusRes = await fetch(`https://graph.threads.net/${apiV}/${creationId}?fields=status&access_token=${getCleanToken(token)}`);
       const statusData = await statusRes.json();
       status = statusData.status;
       if (status === 'ERROR') throw new Error('Meta processing failed');
       attempts++;
    }

    // Publish
    const publishRes = await fetch(`https://graph.threads.net/${apiV}/me/threads_publish`, {
      method: 'POST',
      body: new URLSearchParams({ creation_id: creationId, access_token: token })
    });
    const publishData = await publishRes.json();
    if (!publishRes.ok) throw new Error(publishData.error?.message || 'Final publishing failed');

    res.json({ success: true, id: publishData.id });
  } catch (error) {
    console.error('[Threads Publish] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── GET ANALYTICS ────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const { accountId } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    // Threads Insights API
    const metrics = 'views,likes,replies,reposts,quotes';
    const insightsRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/me/threads_insights?metric=${metrics}&access_token=${getCleanToken(account.accessToken)}`
    );
    const insights = await insightsRes.json();

    // Fetch profile fields (follower_count, biography, etc)
    const profileRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/me?fields=id,username,threads_profile_picture_url,threads_biography,follower_count&access_token=${getCleanToken(account.accessToken)}`
    );
    const profileData = await profileRes.json();

    const stats = {
      followers: profileData.follower_count || account.follower_count || 0,
      biography: profileData.threads_biography || account.biography || '',
      profilePicture: profileData.threads_profile_picture_url || account.profilePicture || '',
      username: profileData.username || account.username || ''
    };
    
    const daily_metrics = [];
    if (insights.data) {
      insights.data.forEach(metric => {
        const total = metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
        stats[metric.name] = total;

        if (metric.name === 'views') {
           metric.values.forEach(v => {
              const date = new Date(v.end_time);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              daily_metrics.push({ name: dayName, views: v.value || 0 });
           });
        }
      });
    }

    // Deep Manual Aggregation for historical data (Max 1000 posts)
    try {
      let aggUrl = `https://graph.threads.net/${THREADS_API_VERSION}/me/threads?fields=like_count,reply_count,repost_count,quote_count&limit=100&access_token=${getCleanToken(account.accessToken)}`;
      let aggPages = 0;
      let aggLikes = 0, aggReplies = 0, aggReposts = 0, aggQuotes = 0;

      while (aggUrl && aggPages < 10) {
        const aggRes = await fetch(aggUrl);
        const aggData = await aggRes.json();
        if (!aggRes.ok) break;

        if (aggData.data) {
          aggData.data.forEach(t => {
            aggLikes += (t.like_count || 0);
            aggReplies += (t.reply_count || 0);
            aggReposts += (t.repost_count || 0);
            aggQuotes += (t.quote_count || 0);
          });
        }
        aggUrl = aggData.paging?.next || null;
        aggPages++;
      }
      
      stats.likes = Math.max(stats.likes || 0, aggLikes);
      stats.replies = Math.max(stats.replies || 0, aggReplies);
      stats.reposts = Math.max(stats.reposts || 0, aggReposts);
      stats.quotes = Math.max(stats.quotes || 0, aggQuotes);
      console.log(`[Threads Analytics Agg] Fetched ${aggPages} pages for deeper historical context.`);
    } catch (e) {
      console.warn('[Threads Aggregation] Failed for analytics:', e.message);
    }

    res.json({ success: true, stats, daily_metrics: daily_metrics.reverse().slice(0, 7).reverse() });
  } catch (error) {
    console.error('[Threads Analytics] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── GET REPLIES ──────────────────────────────────────────────────────────────
export const getReplies = async (req, res) => {
  try {
    const { accountId, threadId } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const fields = 'id,text,timestamp,username,permalink,media_url,media_type';
    const repliesRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/${threadId}/replies?fields=${fields}&access_token=${getCleanToken(account.accessToken)}`
    );
    const repliesData = await repliesRes.json();

    res.json({ success: true, replies: repliesData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── POST REPLY ───────────────────────────────────────────────────────────────
export const postReply = async (req, res) => {
  try {
    const { accountId, threadId, text } = req.body;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const response = await fetch(`https://graph.threads.net/${THREADS_API_VERSION}/${threadId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text,
        media_type: 'TEXT',
        access_token: account.accessToken
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to post reply');

    res.json({ success: true, id: data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── DIRECT MESSAGING (DMs) ──────────────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const { accountId } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    // Fetch conversations from Threads Messenger API
    const fields = 'id,participants,updated_time,unread_count,messages{id,text,created_time,from}';
    const convRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/me/conversations?fields=${fields}&access_token=${getCleanToken(account.accessToken)}`
    );
    const convData = await convRes.json();

    if (!convRes.ok) {
        // Fallback for older tokens or restricted accounts
        if (convData.error?.code === 100) return res.json({ success: true, conversations: [], needsReconnect: true });
        throw new Error(convData.error?.message || 'Failed to fetch conversations');
    }

    res.json({ success: true, conversations: convData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { accountId, conversationId } = req.query;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const fields = 'id,text,created_time,from,to';
    const msgRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/${conversationId}/messages?fields=${fields}&access_token=${getCleanToken(account.accessToken)}`
    );
    const msgData = await msgRes.json();

    res.json({ success: true, messages: msgData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const { accountId, recipientId, text } = req.body;
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const response = await fetch(`https://graph.threads.net/${THREADS_API_VERSION}/me/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
        access_token: account.accessToken
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to send message');

    res.json({ success: true, id: data.message_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── DISCONNECT ACCOUNT ───────────────────────────────────────────────────────
export const disconnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteDoc, getCollection } = await import('../db.js');
    
    console.log(`[Threads Disconnect] Cleaning up data for account: ${id}`);

    // 1. Delete Messages
    const messages = await getCollection('messages');
    const toDelete = messages.filter(m => m.threadsAccountId === id || (m.source === 'threads' && m.uid === req.user?.uid));
    for (const msg of toDelete) {
      await deleteDoc('messages', msg.id);
    }
    console.log(`[Threads Disconnect] Deleted ${toDelete.length} messages.`);

    // 2. Delete Posts/Analytics (if any)
    const posts = await getCollection('threads_posts');
    const postsToDelete = posts.filter(p => p.accountId === id);
    for (const p of postsToDelete) {
      await deleteDoc('threads_posts', p.id);
    }

    // 3. Delete Flows
    const flows = await getCollection('chat_flows_threads');
    const flowsToDelete = flows.filter(f => f.accountId === id);
    for (const f of flowsToDelete) {
      await deleteDoc('chat_flows_threads', f.id);
    }

    // 4. Finally Delete Account
    await deleteDoc('threads_accounts', id);
    
    res.json({ success: true, message: 'Account and all related data deleted' });
  } catch (error) {
    console.error('[Threads Disconnect] Error:', error);
    res.status(500).json({ error: error.message });
  }
};
// ── DELETE THREAD ───────────────────────────────────────────────────────────
export const deleteThread = async (req, res) => {
  try {
    const threadId = req.params.threadId || req.query.threadId;
    const { accountId } = req.query;
    
    if (!accountId || !threadId) return res.status(400).json({ error: 'Missing accountId or threadId' });

    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    // Try to delete via Meta API
    const deleteRes = await fetch(
      `https://graph.threads.net/${THREADS_API_VERSION}/${threadId}?access_token=${getCleanToken(account.accessToken)}`,
      { method: 'DELETE' }
    );
    const data = await deleteRes.json();

    if (!deleteRes.ok) {
      // If Meta doesn't allow it yet, explain it
      const msg = data.error?.message || 'Meta API does not support deleting this type of post yet.';
      return res.status(deleteRes.status).json({ success: false, message: msg });
    }

    res.json({ success: true, message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('[Threads Delete] Error:', error);
    res.status(500).json({ error: error.message });
  }
};
