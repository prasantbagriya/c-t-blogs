import { getCollection, updateDoc } from '../db.js';
import { META_API_VERSION } from '../config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Background worker to publish scheduled Instagram posts
 */
export const startInstagramScheduler = () => {
  console.log('[Instagram Scheduler] Worker started (Interval: 1 minute)');
  
  setInterval(async () => {
    try {
      const now = new Date();
      const allScheduled = await getCollection('instagram_scheduled');
      
      // Filter for pending posts that are due
      const duePosts = allScheduled.filter(post => 
        post.status === 'pending' && 
        new Date(post.scheduledAt) <= now
      );

      if (duePosts.length === 0) return;

      console.log(`[Instagram Scheduler] Found ${duePosts.length} posts due for publishing.`);

      for (const post of duePosts) {
        try {
          await publishScheduledItem(post);
        } catch (err) {
          console.error(`[Instagram Scheduler] Failed to publish post ${post.id}:`, err);
          await updateDoc('instagram_scheduled', post.id, { 
            status: 'failed', 
            error: err.message,
            lastAttempt: new Date().toISOString() 
          });
        }
      }
    } catch (error) {
      console.error('[Instagram Scheduler] Critical Error:', error);
    }
  }, 60 * 1000); // Check every minute
};

const publishScheduledItem = async (post) => {
  console.log(`[Instagram Scheduler] Publishing post ${post.id} for account ${post.accountId}...`);

  // 1. Get Account
  const accounts = await getCollection('instagram_accounts');
  const account = accounts.find(a => a.id === post.accountId);
  if (!account) throw new Error('Account not found');

  const token = account.pageAccessToken || account.accessToken;
  const igId = account.instagramId;
  const apiVersion = META_API_VERSION || 'v22.0';

  // 2. Create Media Container
  const containerParams = new URLSearchParams({
    caption: post.caption,
    access_token: token
  });

  if (post.type === 'reel') {
    containerParams.append('media_type', 'REELS');
    containerParams.append('video_url', post.mediaUrl);
    containerParams.append('share_to_feed', 'true');
  } else if (post.type === 'story') {
    const isVideo = post.mediaUrl.toLowerCase().includes('.mp4');
    if (isVideo) {
      containerParams.append('media_type', 'VIDEO');
      containerParams.append('video_url', post.mediaUrl);
    } else {
      containerParams.append('image_url', post.mediaUrl);
    }
  } else {
    // Post (image)
    containerParams.append('image_url', post.mediaUrl);
  }

  const containerRes = await fetch(
    `https://graph.facebook.com/${apiVersion}/${igId}/media`,
    { method: 'POST', body: containerParams }
  );
  const containerData = await containerRes.json();

  if (!containerRes.ok || !containerData.id) {
    throw new Error(containerData.error?.message || 'Failed to create media container');
  }

  const containerId = containerData.id;

  // 3. Poll status if video/reel
  const isVideo = post.type === 'reel' || post.mediaUrl.toLowerCase().includes('.mp4');
  if (isVideo) {
    let attempts = 0;
    let status = 'IN_PROGRESS';
    while (status !== 'FINISHED' && attempts < 20) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${containerId}?fields=status_code&access_token=${token}`
      );
      const pollData = await pollRes.json();
      status = pollData.status_code || 'IN_PROGRESS';
      attempts++;
      if (status === 'ERROR') throw new Error('Meta processing error');
    }
    if (status !== 'FINISHED') throw new Error('Meta processing timed out');
  }

  // 4. Publish
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
    throw new Error(publishData.error?.message || 'Publishing failed');
  }

  // 5. Update Status
  await updateDoc('instagram_scheduled', post.id, { 
    status: 'published', 
    publishedPostId: publishData.id,
    publishedAt: new Date().toISOString()
  });

  console.log(`[Instagram Scheduler] ✅ Successfully published post ${post.id}. Meta Post ID: ${publishData.id}`);
};
