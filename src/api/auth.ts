import { API_URL, getHeaders, safeJson, encodedPost } from './common';

let currentUser: any = null;
const authListeners: Array<(user: any) => void> = [];

export const auth = {
  get currentUser() {
    return currentUser;
  }
};

export function notifyAuthListeners() {
  authListeners.forEach(listener => listener(currentUser));
}

export function onAuthStateChanged(authObj: any, callback: (user: any) => void) {
  authListeners.push(callback);
  
  const token = localStorage.getItem('chatwiz_token');
  if (token) {
    fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    })
    .then(async res => {
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.error || 'Invalid token');
      }
      return safeJson(res);
    })
    .then(data => {
      currentUser = data.user;
      callback(currentUser);
    })
    .catch((err) => {
      console.warn('Auth check failed:', err.message);
      localStorage.removeItem('chatwiz_token');
      currentUser = null;
      callback(null);
    });
  } else {
    callback(null);
  }
  
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
}

export async function loginAnonymously() {
  const response = await fetch(`${API_URL}/auth/anonymous`, { 
    method: 'POST',
    headers: getHeaders()
  });
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data.error || data.message || 'Login failed');
  localStorage.setItem('chatwiz_token', data.token);
  currentUser = data.token ? data.user : null;
  currentUser = data.user;
  notifyAuthListeners();
  return { user: data.user };
}

export async function signUpWithEmail(email: string, pass: string, name: string) {
  const response = await encodedPost(`${API_URL}/auth/signup`, { email, password: pass, name }, getHeaders());
  
  if (!response.ok) {
    const errorData = await safeJson(response);
    throw new Error(errorData.error || 'Signup failed');
  }
  
  const data = await safeJson(response);
  localStorage.setItem('chatwiz_token', data.token);
  currentUser = data.user;
  notifyAuthListeners();
  return data.user;
}

export async function loginWithEmail(email: string, pass: string) {
  const response = await encodedPost(`${API_URL}/auth/login`, { email, password: pass }, getHeaders());
  
  if (!response.ok) {
    const errorData = await safeJson(response);
    throw new Error(errorData.error || 'Login failed');
  }
  
  const data = await safeJson(response);
  localStorage.setItem('chatwiz_token', data.token);
  currentUser = data.user;
  notifyAuthListeners();
  return data.user;
}

export async function signOut(authObj: any = null) {
  localStorage.removeItem('chatwiz_token');
  currentUser = null;
  notifyAuthListeners();
}

let facebookSdkPromise: Promise<void> | null = null;

function loadFacebookSdk() {
  if ((window as any).FB) return Promise.resolve();
  if (facebookSdkPromise) return facebookSdkPromise;

  facebookSdkPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => reject(new Error('Facebook SDK load timed out. Please try again.')), 10000);

    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId: '1464713225364837',
        cookie: true,
        xfbml: true,
        version: 'v22.0'
      });
      window.clearTimeout(timeout);
      window.dispatchEvent(new Event('FBReady'));
      resolve();
    };

    if (existing) return;

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => {
      window.clearTimeout(timeout);
      facebookSdkPromise = null;
      reject(new Error('Facebook SDK failed to load. Please check your connection and try again.'));
    };
    document.head.appendChild(script);
  });

  return facebookSdkPromise;
}

export async function signInWithFacebook() {
  await loadFacebookSdk();

  return new Promise((resolve, reject) => {
    if (!(window as any).FB) {
      return reject(new Error('Facebook SDK not loaded yet. Please refresh and try again.'));
    }

    console.log('[Facebook SDK] Launching standard FB.login...');
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        console.log('[Facebook SDK] Login successful. AuthResponse received.');
        const code = response.authResponse.code;
        
        // We call our confirmation logic with the code (or token)
        confirmFacebookLogin(code || response.authResponse.accessToken)
          .then(resolve)
          .catch(reject);
      } else {
        console.warn('[Facebook SDK] User cancelled login or did not fully authorize.');
        reject(new Error('User cancelled login or did not authorize the app.'));
      }
    }, { 
      scope: 'public_profile,email',
      response_type: 'code',
      override_default_response_type: true
    });
  });
}

export async function confirmFacebookLogin(code: string | null) {
  // Use a proper, standardized redirect URI
  const redirectUri = window.location.origin + (window.location.pathname.endsWith('/') ? '' : '/') + 'cb.html';
  const res = await encodedPost(`${API_URL}/auth/x-f`, { accessToken: null, code: code || undefined, redirectUri }, getHeaders());
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Backend Facebook auth failed');
  
  localStorage.setItem('chatwiz_token', data.token);
  currentUser = data.user;
  notifyAuthListeners();
  return data.user;
}

export async function forgotPassword(email: string, phone?: string) {
  const response = await encodedPost(`${API_URL}/auth/forgot-password`, { email, phone }, getHeaders());
  const data = await safeJson(response);
  if (!response.ok) throw new Error(data.error || 'Password reset request failed');
  return data;
}

export async function updateUserPreferences(preferences: { theme?: string }) {
  const response = await encodedPost(`${API_URL}/auth/preferences`, preferences, getHeaders());
  if (!response.ok) {
    const errorData = await safeJson(response);
    throw new Error(errorData.error || 'Failed to update preferences');
  }
  return await safeJson(response);
}
