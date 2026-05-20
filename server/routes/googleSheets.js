import express from 'express';
import { getCollection } from '../db.js';
import { processUniversalMessage } from '../flowEngine.js';

const router = express.Router();

// Webhook for Google Sheets
router.post('/webhook', async (req, res) => {
  try {
    const { uid } = req.query;
    const rowData = req.body; // e.g. { Name: ["John"], Phone: ["911234567890"], ... }
    
    if (!uid) return res.status(400).json({ error: 'UID is required' });

    console.log(`[GoogleSheets Webhook] Incoming data for UID: ${uid}`, rowData);

    // 1. Determine the recipient (phone number)
    // We look for common phone column names
    const phoneKey = Object.keys(rowData).find(key => 
      key.toLowerCase().includes('phone') || 
      key.toLowerCase().includes('mobile') || 
      key.toLowerCase().includes('contact')
    );

    const rawPhone = phoneKey ? (Array.isArray(rowData[phoneKey]) ? rowData[phoneKey][0] : rowData[phoneKey]) : null;
    
    if (!rawPhone) {
      console.warn('[GoogleSheets] No phone number found in row data. Cannot trigger WhatsApp flow.');
      return res.status(200).json({ status: 'ignored', reason: 'No phone number found' });
    }

    // Clean phone number
    const recipient = rawPhone.replace(/\D/g, '');

    // 2. Prepare Context from Row Data
    // Google Sheets e.namedValues gives arrays for each key
    const contextData = {};
    Object.keys(rowData).forEach(key => {
       contextData[key.trim()] = Array.isArray(rowData[key]) ? rowData[key][0] : rowData[key];
    });

    // 3. Trigger Flows
    // We call processUniversalMessage with a special 'google_sheets' source
    // This will match 'webhook' nodes with event 'google_sheets_new_row'
    await processUniversalMessage({
      from: recipient,
      text: '[Google Sheet Trigger]',
      source: 'whatsapp', // We target WhatsApp delivery
      isSystemTrigger: true,
      googleSheetsData: contextData
    }, 'whatsapp', { uid, id: 'google_sheets_system' });

    res.json({ status: 'success' });
  } catch (error) {
    console.error('[GoogleSheets Webhook Error]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
