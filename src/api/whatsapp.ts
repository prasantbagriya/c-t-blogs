import { API_URL, getHeaders, safeJson, encodedPost } from './common';

export async function connectWhatsAppWithFacebook(uid: string) {
  const configId = (import.meta as any).env.VITE_META_CONFIG_ID || '1306649528034947';
  
  return new Promise((resolve, reject) => {
    if (!(window as any).FB) {
      return reject(new Error('Facebook SDK not loaded yet. Please refresh and try again.'));
    }

    console.log('[WhatsApp SDK] Launching FB.login popup for WABA connect...');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        console.log('[WhatsApp SDK] Login successful. AuthResponse received.');
        const code = response.authResponse.code;
        
        // We call our confirmation logic with the code (or token)
        confirmWhatsAppConnect(uid, code || response.authResponse.accessToken)
          .then(resolve)
          .catch(reject);
      } else {
        console.warn('[WhatsApp SDK] User cancelled login or did not fully authorize.');
        reject(new Error('User cancelled login or did not authorize the app.'));
      }
    }, { 
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true
    });
  });
}

export async function confirmWhatsAppConnect(uid: string, code: string | null) {
  // Use the origin as the redirect URI base to match common JS SDK behavior
  const redirectUri = window.location.origin + '/'; 
  console.log('[WhatsApp API] Confirming connect for UID:', uid, 'with code:', code?.substring(0, 10) + '...');
  const res = await encodedPost(`${API_URL}/auth/x-w`, { accessToken: null, code: code || undefined, uid, redirectUri }, getHeaders());
  const data = await safeJson(res);
  if (!res.ok) {
    console.error('[WhatsApp API] Confirm Connect Failed:', data);
    throw new Error(data.error + (data.meta_error ? ` (Meta Error ${data.meta_error.code})` : ''));
  }
  console.log('[WhatsApp API] Confirm Connect Success:', data);
  return data;
}


export async function sendWhatsAppMessage(recipient: string, text: string, whatsappAccountId?: string) {
  const res = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ 
      recipient, 
      text, 
      source: 'whatsapp', 
      whatsappAccountId 
    })
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp message');
  return data;
}

export async function syncWhatsAppTemplates(whatsappAccountId: string) {
  const res = await fetch(`${API_URL}/whatsapp/templates/sync/${whatsappAccountId}`, {
    headers: getHeaders()
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to sync templates');
  return data;
}
export async function createWhatsAppFlow(whatsappAccountId: string, flowData: { name: string, categories: string[], structure: any }) {
  const res = await fetch(`${API_URL}/whatsapp/flows/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ 
      whatsappAccountId,
      name: flowData.name,
      categories: flowData.categories,
      structure: flowData.structure
    })
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const errorDetails = data.meta_error ? `Meta Error: ${JSON.stringify(data.meta_error.error_user_msg || data.meta_error.message)}` : data.error;
    throw new Error(errorDetails || 'Failed to create WhatsApp Flow');
  }
  return data;
}

export async function updateWhatsAppFlowAsset(flowId: string, whatsappAccountId: string, structure: any) {
  const res = await fetch(`${API_URL}/whatsapp/flows/${flowId}/asset`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ whatsappAccountId, structure })
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const errorDetails = data.meta_error ? `Meta Error: ${JSON.stringify(data.meta_error.error_user_msg || data.meta_error.message)}` : data.error;
    throw new Error(errorDetails || 'Failed to update Flow asset');
  }
  return data;
}
