import { API_URL, getHeaders, safeJson } from './common';

export async function fetchAdsAccounts() {
 const res = await fetch(`${API_URL}/ads/accounts`, { headers: getHeaders() });
 return safeJson(res);
}

export async function createAdCampaign(data: any) {
 const res = await fetch(`${API_URL}/ads/campaigns`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify(data)
 });
 return safeJson(res);
}

export async function fetchAdMetrics(campaignId: string) {
 const res = await fetch(`${API_URL}/ads/metrics/${campaignId}`, { headers: getHeaders() });
 return safeJson(res);
}
