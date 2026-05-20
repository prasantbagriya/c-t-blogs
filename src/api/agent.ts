import { API_URL, getHeaders, safeJson } from './common';
import { addDoc, updateDoc, getDoc, db, collection, query, where, onSnapshot } from './db';

/**
 * AI Agent API Helpers
 */

export async function createAgent(uid: string, data: any) {
  return await addDoc('ai_agents', { 
    uid, 
    ...data, 
    isActive: false, 
    lastSynced: null,
    createdAt: new Date().toISOString() 
  });
}

export async function updateAgent(id: string, data: any) {
  return await updateDoc(`ai_agents/${id}`, data);
}

export async function syncAgentKnowledge(agentId: string) {
  const res = await fetch(`${API_URL}/agent/sync/${agentId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to sync knowledge');
  return data;
}

export async function getAgentMetadataFromUrl(url: string) {
  const res = await fetch(`${API_URL}/agent/provision?url=${encodeURIComponent(url)}`, {
    headers: getHeaders()
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch metadata');
  return data;
}

/**
 * Product Catalog Helpers
 */
export async function addProduct(agentId: string, product: any) {
  return await addDoc('products', { agentId, ...product });
}

export async function deleteProduct(id: string) {
  // Logic to delete product
}
