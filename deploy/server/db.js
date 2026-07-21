import fs from 'fs/promises';
import fs_sync from 'fs'; 
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSafePath = (fileName) => {
  const serverPath = path.join(__dirname, fileName);
  const rootPath = path.join(__dirname, '..', fileName);
  return fs_sync.existsSync(serverPath) ? serverPath : rootPath;
};

const DB_FILES = {
  CORE: getSafePath('db.json'),
  WHATSAPP: getSafePath('whatsapp_db.json'),
  INSTAGRAM: getSafePath('instagram_db.json'),
  FLOWS: getSafePath('flows_db.json')
};

const COLLECTION_MAP = {
  whatsapp_accounts: DB_FILES.WHATSAPP,
  templates: DB_FILES.WHATSAPP,
  campaigns: DB_FILES.WHATSAPP,
  chat_flows_whatsapp: DB_FILES.FLOWS,
  chat_flows_instagram: DB_FILES.FLOWS,
  chat_flows_widget: DB_FILES.FLOWS,
  widget_settings: DB_FILES.WHATSAPP,
  instagram_accounts: DB_FILES.INSTAGRAM,
  flow_sessions: DB_FILES.CORE,
  payments: DB_FILES.CORE,
  razorpay_settings: DB_FILES.CORE,
  google_settings: DB_FILES.CORE,
  whatsapp_flows: DB_FILES.CORE,
  automations: DB_FILES.CORE,
  shopify_products: DB_FILES.CORE,
  shopify_orders: DB_FILES.CORE,
  shopify_settings: DB_FILES.CORE,
  instagram_scheduled: DB_FILES.INSTAGRAM,
  instagram_comments: DB_FILES.INSTAGRAM,
  threads_accounts: DB_FILES.INSTAGRAM,
  chat_flows_threads: DB_FILES.FLOWS,
};
// ── Write Queuing (Mutex) ──────────────────────────────────────────
const writeQueues = new Map(); // Maps filePath -> Promise chain

async function runQueued(filePath, task) {
  if (!writeQueues.has(filePath)) {
    writeQueues.set(filePath, Promise.resolve());
  }
  const currentQueue = writeQueues.get(filePath);
  const nextTask = currentQueue.then(task);
  writeQueues.set(filePath, nextTask.catch(() => {})); // Prevent chain breakage on error
  return nextTask;
}

// ── In-Memory Cache ───────────────────────────────────────────────
const dbCache = new Map(); // Maps filePath -> JSON data
const cacheLoaded = new Set(); // Track which files are loaded

async function readDbFile(filePath) {
  // Disable memory cache to ensure multi-process reliability and immediate sync
  // if (dbCache.has(filePath)) return dbCache.get(filePath);

  try {
    let rawData = await fs.readFile(filePath, 'utf8');
    // Aggressively remove BOM (U+FEFF) and any leading/trailing whitespace or hidden characters
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    
    if (!cleanData) return {};
    
    // Final safety check: ensure it starts with { or [
    if (!cleanData.startsWith('{') && !cleanData.startsWith('[')) {
       console.error(`[DB] Invalid JSON start in ${filePath}:`, cleanData.substring(0, 20));
       return {};
    }

    const parsed = JSON.parse(cleanData);
    dbCache.set(filePath, parsed);
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function writeDbFile(filePath, data) {
  // Update cache immediately
  dbCache.set(filePath, data);

  const tmpPath = filePath + '.tmp';
  const lockPath = filePath + '.lock';
  
  let retries = 0;
  while (retries < 20) {
    try {
      await fs.access(lockPath);
      await new Promise(r => setTimeout(r, 50));
      retries++;
    } catch { break; }
  }
  
  try {
    await fs.writeFile(lockPath, process.pid.toString());
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
    
    let renameRetries = 0;
    while (renameRetries < 5) {
      try {
        await fs.rename(tmpPath, filePath);
        break;
      } catch (err) {
        if (err.code === 'EPERM' || err.code === 'EBUSY') {
          renameRetries++;
          await new Promise(r => setTimeout(r, 100));
          if (renameRetries === 5) await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        } else throw err;
      }
    }
  } finally {
    try { await fs.unlink(lockPath); } catch {}
    try { await fs.unlink(tmpPath); } catch {}
  }
}

function getFileForCollection(collection) {
  return COLLECTION_MAP[collection] || DB_FILES.CORE;
}

export async function getDb() {
  const [core, whatsapp, instagram, flows] = await Promise.all([
    readDbFile(DB_FILES.CORE),
    readDbFile(DB_FILES.WHATSAPP),
    readDbFile(DB_FILES.INSTAGRAM),
    readDbFile(DB_FILES.FLOWS)
  ]);

  return {
    ...core, ...whatsapp, ...instagram, ...flows,
    messages: { ...(core.messages || {}), ...(whatsapp.messages || {}), ...(instagram.messages || {}) }
  };
}

export async function saveDb(data) {
  const whatsappKeys = Object.keys(COLLECTION_MAP).filter(k => COLLECTION_MAP[k] === DB_FILES.WHATSAPP);
  const instagramKeys = Object.keys(COLLECTION_MAP).filter(k => COLLECTION_MAP[k] === DB_FILES.INSTAGRAM);
  const flowsKeys = Object.keys(COLLECTION_MAP).filter(k => COLLECTION_MAP[k] === DB_FILES.FLOWS);

  const whatsappDb = { messages: {} };
  const instagramDb = { messages: {} };
  const flowsDb = {};
  const coreDb = { ...data };

  [whatsappKeys, instagramKeys, flowsKeys].forEach((keys, idx) => {
    const target = [whatsappDb, instagramDb, flowsDb][idx];
    keys.forEach(k => { if (data[k]) { target[k] = data[k]; delete coreDb[k]; } });
  });

  if (data.messages) {
    coreDb.messages = {};
    Object.entries(data.messages).forEach(([id, msg]) => {
      if (msg.source === 'whatsapp' || msg.whatsappAccountId) whatsappDb.messages[id] = msg;
      else if (msg.source === 'instagram' || msg.instagramAccountId) instagramDb.messages[id] = msg;
      else coreDb.messages[id] = msg;
    });
  }

  await Promise.all([
    runQueued(DB_FILES.CORE, () => writeDbFile(DB_FILES.CORE, coreDb)),
    runQueued(DB_FILES.WHATSAPP, () => writeDbFile(DB_FILES.WHATSAPP, whatsappDb)),
    runQueued(DB_FILES.INSTAGRAM, () => writeDbFile(DB_FILES.INSTAGRAM, instagramDb)),
    runQueued(DB_FILES.FLOWS, () => writeDbFile(DB_FILES.FLOWS, flowsDb))
  ]);
}

export async function getDoc(collection, id) {
  if (collection === 'messages') return (await getDb()).messages[id] || null;
  const data = await readDbFile(getFileForCollection(collection));
  return (data[collection] && data[collection][id]) ? data[collection][id] : null;
}

export async function setDoc(collection, id, data, merge = false) {
  let filePath = getFileForCollection(collection);
  if (collection === 'messages') {
    if (data.source === 'whatsapp' || data.whatsappAccountId) filePath = DB_FILES.WHATSAPP;
    else if (data.source === 'instagram' || data.instagramAccountId) filePath = DB_FILES.INSTAGRAM;
    else filePath = DB_FILES.CORE;
  }

  return await runQueued(filePath, async () => {
    const dbData = await readDbFile(filePath);
    if (!dbData[collection]) dbData[collection] = {};
    const idField = collection === 'users' ? 'uid' : 'id';
    const finalData = merge && dbData[collection][id] ? { ...dbData[collection][id], ...data } : data;
    if (!finalData[idField]) finalData[idField] = id;
    dbData[collection][id] = finalData;
    await writeDbFile(filePath, dbData);
    return finalData;
  });
}

export async function getCollection(collection) {
  if (collection === 'messages') return Object.values((await getDb()).messages || {});
  const data = await readDbFile(getFileForCollection(collection));
  return data[collection] ? Object.values(data[collection]) : [];
}

export async function addDoc(collection, data) {
  const idField = collection === 'users' ? 'uid' : 'id';
  // M-8 FIX: Use crypto.randomUUID() with fallback for older Node.js versions
  const id = (crypto.randomUUID && typeof crypto.randomUUID === 'function') 
    ? crypto.randomUUID() 
    : `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return await setDoc(collection, id, { ...data, [idField]: id });
}

export async function updateDoc(collection, id, data) {
  return await setDoc(collection, id, data, true);
}

export async function deleteDoc(collection, id) {
  if (collection === 'messages') {
    for (const filePath of Object.values(DB_FILES)) {
      const result = await runQueued(filePath, async () => {
        const dbData = await readDbFile(filePath);
        if (dbData.messages && dbData.messages[id]) {
          delete dbData.messages[id];
          await writeDbFile(filePath, dbData);
          return true;
        }
        return false;
      });
      if (result) return true;
    }
    return false;
  }

  const filePath = getFileForCollection(collection);
  return await runQueued(filePath, async () => {
    const dbData = await readDbFile(filePath);
    if (dbData[collection] && dbData[collection][id]) {
      delete dbData[collection][id];
      await writeDbFile(filePath, dbData);
      return true;
    }
    return false;
  });
}

export async function writeCollection(collection, items) {
  const filePath = getFileForCollection(collection);
  return await runQueued(filePath, async () => {
    const dbData = await readDbFile(filePath);
    dbData[collection] = {};
    const idField = collection === 'users' ? 'uid' : 'id';
    items.forEach(item => {
      const id = item[idField];
      if (id) dbData[collection][id] = item;
    });
    await writeDbFile(filePath, dbData);
    return items;
  });
}
