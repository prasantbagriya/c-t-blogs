import { getHeaders, API_URL } from './common';

export const getFacebookPages = async () => {
 const res = await fetch(`${API_URL}/facebook/pages`, {
 headers: getHeaders()
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to fetch pages');
 return data.pages;
};

export const connectFacebookPage = async (pageData: any) => {
 // Meta API returns 'id' and 'access_token' — server expects 'pageId' and 'pageAccessToken'
 const payload = {
 pageId: pageData.pageId || pageData.id,
 pageAccessToken: pageData.pageAccessToken || pageData.access_token,
 pageName: pageData.pageName || pageData.name,
 instagramBusinessAccount: pageData.instagram_business_account || pageData.instagramBusinessAccount || null
 };

 const res = await fetch(`${API_URL}/facebook/pages/connect`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify(payload)
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to connect page');
 return data;
};

export const getFacebookPageDetails = async (pageId: string) => {
 const res = await fetch(`${API_URL}/facebook/pages/${pageId}`, {
 headers: getHeaders()
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to fetch page details');
 return data.page;
};

export const publishFacebookPost = async (pageId: string, message: string, link?: string) => {
 const res = await fetch(`${API_URL}/facebook/pages/publish`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify({ pageId, message, link })
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to publish post');
 return data;
};

export const getFacebookFeed = async (pageId: string) => {
 const res = await fetch(`${API_URL}/facebook/pages/${pageId}/feed`, {
 headers: getHeaders()
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to fetch feed');
 return data.feed;
};

export const getFacebookPostComments = async (postId: string, pageId: string) => {
 const res = await fetch(`${API_URL}/facebook/posts/${postId}/comments?pageId=${pageId}`, {
 headers: getHeaders()
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');
 return data.comments;
};

export const replyToFacebookComment = async (commentId: string, pageId: string, message: string) => {
 const res = await fetch(`${API_URL}/facebook/comments/${commentId}/reply`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify({ pageId, message })
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to post reply');
 return data;
};

export const getFacebookPageAnalytics = async (pageId: string) => {
 const res = await fetch(`${API_URL}/facebook/pages/${pageId}/analytics`, {
 headers: getHeaders()
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
 return data.insights;
};
