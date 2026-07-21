import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlitePath = path.join(__dirname, 'database.sqlite');
const db = new Database(sqlitePath);
db.pragma('journal_mode = WAL');

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    collection TEXT,
    id TEXT,
    data JSON,
    PRIMARY KEY (collection, id)
  )
`);

const stmtGet = db.prepare('SELECT data FROM documents WHERE collection = ? AND id = ?');
const stmtGetAll = db.prepare('SELECT data FROM documents WHERE collection = ?');
const stmtGetAllDb = db.prepare('SELECT collection, id, data FROM documents');
const stmtInsert = db.prepare('INSERT INTO documents (collection, id, data) VALUES (?, ?, ?) ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data');
const stmtDelete = db.prepare('DELETE FROM documents WHERE collection = ? AND id = ?');

// --- AUTO MIGRATION LOGIC FOR HOSTINGER ---
try {
  const rowCount = db.prepare('SELECT count(*) as count FROM documents').get();
  if (rowCount.count === 0) {
    console.log('[DB] SQLite is empty. Attempting to auto-migrate from JSON files...');
    import('fs').then(fs => {
      const DB_FILES = {
        CORE: path.join(__dirname, 'db.json'),
        WHATSAPP: path.join(__dirname, 'whatsapp_db.json'),
        INSTAGRAM: path.join(__dirname, 'instagram_db.json'),
        FLOWS: path.join(__dirname, 'flows_db.json')
      };
      
      let migrated = 0;
      for (const [name, filePath] of Object.entries(DB_FILES)) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(raw.replace(/^\uFEFF/, '').trim());
            db.transaction(() => {
              for (const [collection, items] of Object.entries(data)) {
                if (typeof items === 'object' && items !== null) {
                  for (const [id, itemData] of Object.entries(items)) {
                    stmtInsert.run(collection, id, JSON.stringify(itemData));
                    migrated++;
                  }
                }
              }
            })();
            console.log(`[DB] Migrated ${name} successfully.`);
            // Rename the old file so we don't migrate again
            fs.renameSync(filePath, filePath + '.migrated');
          } catch(e) {
            console.error(`[DB] Failed to migrate ${filePath}:`, e.message);
          }
        }
      }
      console.log(`[DB] Auto-migration complete. ${migrated} records transferred.`);
    });
  }
} catch (e) {
  console.error('[DB] Auto-migration error:', e);
}
// ------------------------------------------

// ── Exported Functions ───────────────────────────────────────────────

export async function getDb() {
  const rows = stmtGetAllDb.all();
  const result = {};
  for (const row of rows) {
    if (!result[row.collection]) result[row.collection] = {};
    result[row.collection][row.id] = JSON.parse(row.data);
  }
  return result;
}

export async function saveDb(data) {
  // Legacy function: takes a full DB object and saves it
  const transaction = db.transaction((dbData) => {
    for (const [collection, items] of Object.entries(dbData)) {
      if (typeof items === 'object' && items !== null) {
        for (const [id, itemData] of Object.entries(items)) {
          stmtInsert.run(collection, id, JSON.stringify(itemData));
        }
      }
    }
  });
  transaction(data);
}

export async function getDoc(collection, id) {
  const row = stmtGet.get(collection, id);
  return row ? JSON.parse(row.data) : null;
}

export async function setDoc(collection, id, data, merge = false) {
  let finalData = data;
  if (merge) {
    const existing = await getDoc(collection, id);
    if (existing) {
      finalData = { ...existing, ...data };
    }
  }
  
  const idField = collection === 'users' ? 'uid' : 'id';
  if (!finalData[idField]) finalData[idField] = id;
  
  stmtInsert.run(collection, id, JSON.stringify(finalData));
  return finalData;
}

export async function getCollection(collection) {
  const rows = stmtGetAll.all(collection);
  return rows.map(row => JSON.parse(row.data));
}

export async function addDoc(collection, data) {
  const idField = collection === 'users' ? 'uid' : 'id';
  const id = (crypto.randomUUID && typeof crypto.randomUUID === 'function') 
    ? crypto.randomUUID() 
    : `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return await setDoc(collection, id, { ...data, [idField]: id });
}

export async function updateDoc(collection, id, data) {
  return await setDoc(collection, id, data, true);
}

export async function deleteDoc(collection, id) {
  const info = stmtDelete.run(collection, id);
  return info.changes > 0;
}

export async function writeCollection(collection, items) {
  const idField = collection === 'users' ? 'uid' : 'id';
  const transaction = db.transaction((itemsToSave) => {
    for (const item of itemsToSave) {
      const id = item[idField];
      if (id) {
        stmtInsert.run(collection, id, JSON.stringify(item));
      }
    }
  });
  transaction(items);
  return items;
}
