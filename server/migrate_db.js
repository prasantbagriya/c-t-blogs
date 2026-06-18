import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILES = {
  CORE: path.join(__dirname, 'db.json'),
  WHATSAPP: path.join(__dirname, 'whatsapp_db.json'),
  INSTAGRAM: path.join(__dirname, 'instagram_db.json'),
  FLOWS: path.join(__dirname, 'flows_db.json')
};

const sqlitePath = path.join(__dirname, 'database.sqlite');

async function readOldDb(filePath) {
  try {
    const rawData = await fs.readFile(filePath, 'utf8');
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    if (!cleanData) return {};
    return JSON.parse(cleanData);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    console.warn(`Could not read ${filePath}: ${err.message}`);
    return {};
  }
}

async function migrate() {
  console.log('Starting Database Migration to SQLite...');
  
  const db = new Database(sqlitePath);
  db.pragma('journal_mode = WAL');

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      collection TEXT,
      id TEXT,
      data JSON,
      PRIMARY KEY (collection, id)
    )
  `);

  const insert = db.prepare('INSERT INTO documents (collection, id, data) VALUES (?, ?, ?) ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data');

  let totalMigrated = 0;

  for (const [name, filePath] of Object.entries(DB_FILES)) {
    console.log(`Reading ${name} from ${filePath}...`);
    const data = await readOldDb(filePath);
    
    db.transaction(() => {
      for (const [collection, items] of Object.entries(data)) {
        if (typeof items === 'object' && items !== null) {
           for (const [id, itemData] of Object.entries(items)) {
             insert.run(collection, id, JSON.stringify(itemData));
             totalMigrated++;
           }
        }
      }
    })();
    console.log(`Finished processing ${name}.`);
  }

  db.close();
  console.log(`Migration Complete! Successfully migrated ${totalMigrated} documents to SQLite.`);
}

migrate().catch(console.error);
