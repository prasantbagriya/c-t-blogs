import { setDoc, getCollection, addDoc, updateDoc, getDoc } from '../db.js';
import { META_API_VERSION } from '../config.js';
import { getCleanToken } from '../utils/tokenCleaner.js';

const apiV = META_API_VERSION || 'v22.0';

export const getPages = async (req, res) => {
  try {
    const uid = req.user.parentId || req.user.uid;
    const accounts = await getCollection('instagram_accounts');
    
    const sortedAccounts = (accounts || [])
      .filter(acc => acc.uid === uid && acc.accessToken && acc.accessToken.length > 10)
      .sort((a, b) => new Date(b.lastSynced || 0).getTime() - new Date(a.lastSynced || 0).getTime());

    const account = sortedAccounts[0];

    if (!account) {
      return res.status(404).json({ error: 'No Facebook connection found. Please reconnect your account.' });
    }

    const token = getCleanToken(account.accessToken);

    if (!token || token.length < 20) {
      return res.status(400).json({ error: 'Token extraction failed. Please reconnect your account.' });
    }

    const fbRes = await fetch(`https://graph.facebook.com/${apiV}/me/accounts?fields=name,access_token,category,fan_count,picture{url},instagram_business_account&access_token=${token}`);
    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error('[FB getPages] Meta API error:', fbData.error);
      return res.status(fbRes.status).json({ error: fbData.error?.message || 'Meta API rejected the token' });
    }

    res.json({ success: true, pages: fbData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPageDetails = async (req, res) => {
  try {
    const { pageId } = req.params;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page not connected or token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const fields = 'name,fan_count,followers_count,category,picture{url},about,description,website,link';
    const pageRes = await fetch(`https://graph.facebook.com/${apiV}/${pageId}?fields=${fields}&access_token=${token}`);
    const pageData = await pageRes.json();

    if (!pageRes.ok) throw new Error(pageData.error?.message || 'Failed to fetch page details');

    res.json({ success: true, page: pageData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const publishPost = async (req, res) => {
  try {
    const { pageId, message, link } = req.body;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const params = new URLSearchParams({ 
      message, 
      ...(link ? { link } : {}),
      access_token: decodeURIComponent(token) // URLSearchParams will encode it
    });

    const postRes = await fetch(`https://graph.facebook.com/${apiV}/${pageId}/feed`, {
      method: 'POST',
      body: params
    });
    const postData = await postRes.json();

    if (!postRes.ok) throw new Error(postData.error?.message || 'Failed to publish post');

    res.json({ success: true, postId: postData.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { pageId } = req.params;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const fields = 'id,message,story,created_time,full_picture,permalink_url,shares,likes.summary(true),comments.summary(true)';
    const feedRes = await fetch(`https://graph.facebook.com/${apiV}/${pageId}/feed?fields=${fields}&limit=20&access_token=${token}`);
    const feedData = await feedRes.json();

    if (!feedRes.ok) throw new Error(feedData.error?.message || 'Failed to fetch feed');

    res.json({ success: true, feed: feedData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { pageId } = req.query;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const fields = 'id,message,from,created_time,like_count,comment_count,parent';
    const commentsRes = await fetch(`https://graph.facebook.com/${apiV}/${postId}/comments?fields=${fields}&access_token=${token}`);
    const commentsData = await commentsRes.json();

    if (!commentsRes.ok) throw new Error(commentsData.error?.message || 'Failed to fetch comments');

    res.json({ success: true, comments: commentsData.data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { pageId, message } = req.body;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const params = new URLSearchParams({ 
      message, 
      access_token: decodeURIComponent(token) 
    });

    const replyRes = await fetch(`https://graph.facebook.com/${apiV}/${commentId}/comments`, {
      method: 'POST',
      body: params
    });
    const replyData = await replyRes.json();

    if (!replyRes.ok) throw new Error(replyData.error?.message || 'Failed to post reply');

    res.json({ success: true, id: replyData.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { pageId } = req.params;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.pageId === pageId);

    if (!account || !account.pageAccessToken) {
      return res.status(404).json({ error: 'Page token missing.' });
    }

    const token = getCleanToken(account.pageAccessToken);
    const metrics = 'page_impressions,page_engaged_users,page_post_engagements,page_fans';
    const insightsRes = await fetch(`https://graph.facebook.com/${apiV}/${pageId}/insights?metric=${metrics}&period=day&access_token=${token}`);
    const insightsData = await insightsRes.json();

    if (!insightsRes.ok) throw new Error(insightsData.error?.message || 'Failed to fetch insights');

    res.json({ success: true, insights: insightsData.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

