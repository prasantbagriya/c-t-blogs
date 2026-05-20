import { API_URL, getHeaders, safeJson } from './common';

export async function sendMessage(
  recipient: string, 
  text: string, 
  source: string, 
  chatId?: string, 
  whatsappAccountId?: string,
  templateName?: string,
  languageCode?: string,
  components?: any[],
  campaignId?: string,
  instagramAccountId?: string,
  threadsAccountId?: string
) {
  const res = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ 
      recipient, 
      text, 
      source, 
      chatId, 
      whatsappAccountId,
      instagramAccountId,
      threadsAccountId,
      templateName,
      languageCode,
      components,
      campaignId
    })
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

export async function getAISuggestion(history: any[]) {
  const res = await fetch(`${API_URL}/ai/suggest`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ history })
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'AI suggestion failed');
  return data.suggestion;
}

export async function reportIncomingMessage(text: string, from: string) {
  const res = await fetch(`${API_URL}/messages/receive`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text, from })
  });
  return safeJson(res);
}

export async function getBlacklist() {
  const res = await fetch(`${API_URL}/compliance/blacklist`, { headers: getHeaders() });
  return safeJson(res);
}
