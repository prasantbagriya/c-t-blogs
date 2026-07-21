import { google } from 'googleapis';
import { getCollection } from '../db.js';

/**
 * Appends a row of data to a Google Sheet.
 * @param {string} spreadsheetId 
 * @param {string} range 
 * @param {Object} rowData - Key-Value pairs where keys match headers
 */

let cachedAuth = null;

export async function appendToGoogleSheet(spreadsheetId, range, rowData, uid = null) {
  try {
    let authClient = null;

    if (uid) {
      const accounts = await getCollection('google_workspace_accounts');
      const account = accounts.find(a => a.uid === uid);
      if (account && account.accessToken) {
        authClient = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        authClient.setCredentials({
          access_token: account.accessToken,
          refresh_token: account.refreshToken,
          expiry_date: account.expiryDate
        });
      }
    }

    if (!authClient) {
      if (!cachedAuth) {
        cachedAuth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      }
      authClient = cachedAuth;
    }

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // 1. Get existing headers to map the row correctly
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${range}!1:1`,
    });

    const headers = response.data.values ? response.data.values[0] : [];
    
    // 2. Prepare the row based on headers
    const row = headers.map(header => rowData[header] || '');

    // If headers are empty, just append values as they are
    const values = headers.length > 0 ? [row] : [Object.values(rowData)];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return { success: true };
  } catch (error) {
    console.error('[Google Sheets Utility Error]', error);
    throw error;
  }
}
