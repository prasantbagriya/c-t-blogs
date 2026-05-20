import { getCollection } from '../server/db.js';

async function test() {
  try {
    console.log('Testing wa-c collection...');
    const data = await getCollection('whatsapp_accounts');
    console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('Count:', data.length);
  } catch (err) {
    console.error('Error fetching collection:', err);
  }
}

test();
