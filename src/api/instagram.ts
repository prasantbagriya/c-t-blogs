import { API_URL, getHeaders, safeJson } from './common';

export function getInstagramAuthUrl() {
 const clientId = (import.meta as any).env.VITE_META_APP_ID || '1464713225364837';
 const redirectUri = window.location.origin + (window.location.pathname.endsWith('/') ? '' : '/') + 'instagram-callback'; 
 const scope = 'instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,pages_manage_metadata';
 
 return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=instagram_connect`;
}

import { loadFacebookSdk } from './auth';

/**
 * Helper to ensure FB SDK is loaded before calling login
 */
async function ensureFBSDK(): Promise<any> {
 try {
 await loadFacebookSdk();
 return (window as any).FB;
 } catch (err) {
 throw new Error('Facebook SDK failed to load. Please check your internet or disable adblockers.');
 }
}

export async function connectInstagramWithFacebook(uid: string) {
 try {
 const FB = await ensureFBSDK();
 
 return new Promise((resolve, reject) => {
 console.log('[Instagram SDK] Launching standard FB.login for Page management...');
 FB.login((response: any) => {
 if (response.authResponse) {
 console.log('[Instagram SDK] Login successful. AuthResponse received.', response.authResponse);
 const accessToken = response.authResponse.accessToken;
 const code = response.authResponse.code;
 
 connectInstagramAccount(uid, { code, accessToken })
 .then(resolve)
 .catch(reject);
 } else {
 console.warn('[Instagram SDK] User cancelled login or did not fully authorize.');
 reject(new Error('User cancelled login or did not authorize the app.'));
 }
 }, { 
 scope: 'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_manage_comments,instagram_content_publish',
 return_scopes: true
 });
 });
 } catch (err: any) {
 throw err;
 }
}

/**
 * connectInstagramAccount: Unified handler that accepts either a code OR accessToken from FB.login
 */
export async function connectInstagramAccount(uid: string, auth: { code?: string; accessToken?: string }) {
 const redirectUri = window.location.origin + (window.location.pathname.endsWith('/') ? '' : '/') + 'instagram-callback';
 
 // Use plain JSON POST — the server reads req.body directly
 const res = await fetch(`${API_URL}/instagram/callback`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify({
 code: auth.code || undefined,
 accessToken: auth.accessToken || undefined,
 uid,
 redirectUri
 })
 });
 
 const data = await safeJson(res);
 if (!res.ok) {
 let errorMsg = data.error || 'Failed to connect Instagram';
 if (data.meta_error) {
 errorMsg += ` (Meta Error ${data.meta_error.code})`;
 }
 throw new Error(errorMsg);
 }
 return data;
}

/** @deprecated Use connectInstagramAccount instead */
export async function connectInstagramWithCode(uid: string, code: string) {
 return connectInstagramAccount(uid, { code });
}
