import { getCollection, updateDoc } from '../db.js';
import { processFlowMessage } from '../flowEngine.js';
import { google } from 'googleapis';

export function startSheetsPolling(intervalMs = 120000) {
  console.log(`[SheetsPolling] Starting background polling engine (Interval: ${intervalMs}ms)...`);
  
  setInterval(async () => {
    try {
      const settings = await getCollection('google_settings');
      const accounts = await getCollection('google_workspace_accounts');
      const waAccounts = await getCollection('whatsapp_accounts');

      for (const setting of settings) {
        if (!setting.spreadsheetId || !setting.sheetName) continue;

        const gAccount = accounts.find(a => a.uid === setting.uid);
        if (!gAccount || !gAccount.accessToken) continue;

        const waAccount = waAccounts.find(a => a.uid === setting.uid);
        if (!waAccount) continue; // Needs a connected WhatsApp to send flows

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
          access_token: gAccount.accessToken,
          refresh_token: gAccount.refreshToken,
          expiry_date: gAccount.expiryDate
        });

        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
        
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: setting.spreadsheetId,
            range: setting.sheetName,
          });

          const rows = res.data.values;
          if (!rows || rows.length === 0) continue;

          const lastProcessedRow = setting.lastProcessedRow || 1; // Assume 1 is headers
          const headers = rows[0];

          if (rows.length > lastProcessedRow) {
            console.log(`[SheetsPolling] Found ${rows.length - lastProcessedRow} new rows for UID: ${setting.uid}`);

            for (let i = lastProcessedRow; i < rows.length; i++) {
              const rowDataArray = rows[i];
              if (!rowDataArray || rowDataArray.length === 0) continue;

              const rowData = {};
              for (let j = 0; j < headers.length; j++) {
                if (headers[j]) {
                  rowData[headers[j]] = rowDataArray[j] || '';
                }
              }

              // Look for phone number
              const phoneKeys = Object.keys(rowData).filter(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number') || k.toLowerCase() === 'whatsapp');
              const phone = phoneKeys.length > 0 ? rowData[phoneKeys[0]] : null;

              if (phone) {
                const cleanPhone = String(phone).replace(/\D/g, '');
                if (cleanPhone) {
                  await processFlowMessage({
                    from: cleanPhone,
                    text: 'Google Sheet Row Added',
                    googleSheetsData: rowData
                  }, waAccount);
                  console.log(`[SheetsPolling] Dispatched flow trigger for ${cleanPhone}`);
                }
              }
            }

            // Update last processed row
            await updateDoc('google_settings', setting.id, { lastProcessedRow: rows.length });
          }
        } catch (apiErr) {
          console.error(`[SheetsPolling] API Error for UID ${setting.uid}:`, apiErr.message);
        }
      }
    } catch (err) {
      console.error('[SheetsPolling] Main loop error:', err);
    }
  }, intervalMs);
}
