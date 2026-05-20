import { API_URL, getHeaders, safeJson } from './common';

export const db = 'api_db';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const collectionMap: Record<string, string> = {
  'whatsapp_accounts': 'wa-c',
  'instagram_accounts': 'ig-c',
  'messages': 'ms-c',
  'campaigns': 'cp-c',
  'templates': 'tp-c',
  'blacklist': 'bl-c',
  'widget_settings': 'ws-c',
  'chat_flows_whatsapp': 'fw-c',
  'chat_flows_instagram': 'fi-c',
  'chat_flows_widget': 'fwd-c',
  'chat_widgets': 'wd-c',
  'ai_agents': 'aa-c',
  'products': 'pd-c',
  'tickets': 'tk-c',
  'customer_profiles': 'cm-c',
  'users': 'us-c',
  'threads_accounts': 'th-c',
  'chat_flows_threads': 'ft-c',
  'threads_posts': 'tp-p',
};

function resolveCollection(name: string) {
  return collectionMap[name] || name;
}

function clearCache(collectionName: string) {
  if (typeof window === 'undefined') return;
  const resolvedName = resolveCollection(collectionName);
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(`cw_cache_${resolvedName}`) || key.startsWith(`cw_cache_${collectionName}`))) {
      keysToRemove.push(key);
      keysToRemove.push(key + '_ts');
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function handleDatabaseError(error: any, operationType: OperationType, path: string | null) {
  console.error("Database API Error:", operationType, path, error);
  if (typeof window !== 'undefined' && (window as any).showToast) {
    const message = error.message || "A database error occurred. Please try again.";
    (window as any).showToast(`${operationType.toUpperCase()} Error: ${message}`, "error");
  }
}

export const collection = (db: any, name: string) => name;
export const doc = (db: any, collectionName: string, id: string) => `${collectionName}/${id}`;
export const serverTimestamp = () => new Date().toISOString();

export async function addDoc(collectionName: string, data: any) {
  const resolvedName = resolveCollection(collectionName);
  const res = await fetch(`${API_URL}/${resolvedName}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || 'Failed to add document');
  clearCache(collectionName);
  return result;
}

export async function getDoc(pathStr: string) {
  const parts = pathStr.split('/');
  parts[0] = resolveCollection(parts[0]);
  const resolvedPath = parts.join('/');

  const res = await fetch(`${API_URL}/${resolvedPath}`, { headers: getHeaders() });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Failed to get document');
  return {
    id: data.id,
    data: () => data,
    exists: () => !!data && !data.error
  };
}

export async function updateDoc(pathStr: string, data: any) {
  const parts = pathStr.split('/');
  parts[0] = resolveCollection(parts[0]);
  const resolvedPath = parts.join('/');

  const res = await fetch(`${API_URL}/${resolvedPath}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || 'Failed to update document');
  clearCache(parts[0]);
  return result;
}

export async function setDoc(collectionName: string, id: string, data: any) {
  const resolvedName = resolveCollection(collectionName);
  const res = await fetch(`${API_URL}/${resolvedName}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || 'Failed to set document');
  clearCache(collectionName);
  return result;
}

export async function deleteDoc(pathStr: string) {
  const parts = pathStr.split('/');
  parts[0] = resolveCollection(parts[0]);
  const resolvedPath = parts.join('/');

  const res = await fetch(`${API_URL}/${resolvedPath}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const result = await safeJson(res);
  if (!res.ok) throw new Error(result.error || 'Failed to delete document');
  clearCache(parts[0]);
  return result;
}

export function where(field: string, op: string, val: any) {
  return { type: 'where', field, op, val };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function query(collectionName: string, ...constraints: any[]) {
  return { collectionName, constraints };
}

export function onSnapshot(q: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) {
  const rawName = typeof q === 'string' ? q : q.collectionName;
  const collectionName = resolveCollection(rawName);

  const cacheKey = `cw_cache_${collectionName}_${JSON.stringify(q.constraints || [])}`;
  const CACHE_TTL_MS = 5 * 60 * 1000;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheKey + '_ts');
    const isFresh = cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_TTL_MS;
    
    if (cached && isFresh) {
      try {
        const data = JSON.parse(cached);
        callback({
          docs: data.map((d: any) => ({ id: d.id || d.uid, data: () => d })),
          length: data.length,
          fromCache: true
        });
      } catch (e) {
        console.warn('Cache parsing failed:', e);
      }
    }
  }

  const fetchData = () => {
    let url = `${API_URL}/${collectionName}`;
    const params = new URLSearchParams();

    if (q.constraints) {
      q.constraints.forEach((c: any) => {
        if (c.type === 'where' && c.op === '==') {
          params.append(c.field, c.val);
        }
      });
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    fetch(url, { headers: getHeaders() })
      .then(res => safeJson(res))
      .then(data => {
        let finalData = Array.isArray(data) ? data : [];
        if (q.constraints) {
          q.constraints.forEach((c: any) => {
            if (c.type === 'where' && c.op === '==') {
              finalData = finalData.filter(d => d[c.field] === c.val);
            }
          });

          const sortConstraint = q.constraints.find((c: any) => c.type === 'orderBy');
          if (sortConstraint) {
            finalData.sort((a, b) => {
              const valA = a[sortConstraint.field];
              const valB = b[sortConstraint.field];
              if (sortConstraint.direction === 'desc') {
                return valB > valA ? 1 : -1;
              }
              return valA > valB ? 1 : -1;
            });
          }
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify(finalData));
          localStorage.setItem(cacheKey + '_ts', Date.now().toString());
        }

        callback({
          docs: finalData.map(d => ({ id: d.id || d.uid, data: () => d })),
          length: finalData.length,
          fromCache: false
        });
      })
      .catch(err => {
        console.error(`Error in onSnapshot for ${collectionName}:`, err);
        if (errorCallback) errorCallback(err);
      });
  };

  fetchData();

  const REALTIME_COLLECTIONS = ['messages'];
  const pollInterval = REALTIME_COLLECTIONS.includes(collectionName) ? 10000 : 30000;
  const interval = setInterval(fetchData, pollInterval);

  return () => clearInterval(interval);
}
