import express from 'express';
import { getCollection, addDoc } from '../db.js';

const router = express.Router();

// ── GENERIC THREADS WEBHOOK (Messages/Replies) ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const { object, entry } = req.body;
    if (object !== 'threads') return res.status(404).send('Not a threads object');

    console.log('[Threads Webhook] Event Received:', JSON.stringify(req.body));

    for (const e of entry) {
      const changes = e.changes || [];
      for (const change of changes) {
        const { field, value } = change;
        
        // Handle New Messages/Replies
        if (field === 'threads') {
          const { 
            id: threadId, 
            text, 
            username, 
            from_threads_user_id: from,
            parent_id: parentId 
          } = value;

          if (text) {
            const accounts = await getCollection('threads_accounts');
            // Match account by threadsId or username
            const account = accounts.find(acc => acc.username === username || acc.threadsId === e.id);

            if (account) {
              // Save incoming message
              await addDoc('messages', {
                uid: account.uid,
                sender: from,
                senderName: username || from,
                text,
                source: 'threads',
                threadsAccountId: account.id,
                chatId: from,
                timestamp: new Date().toISOString(),
                threadId: threadId,
                parentId: parentId || null
              });

              // Trigger Flow Engine
              const { processThreadsMessage } = await import('../flowEngine.js');
              await processThreadsMessage({
                id: threadId,
                from,
                text,
                parentId,
                username
              }, { ...account, platform: 'threads' });
            } else {
              console.warn(`[Threads Webhook] No account found for username: ${username} or ID: ${e.id}`);
            }
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('[Threads Webhook Error]', error);
    res.status(500).send('Error');
  }
});

// ── DEAUTHORIZATION CALLBACK ────────────────────────────────────────────────
// Pinged by Meta when a user removes the app
router.post('/deauthorize', async (req, res) => {
  try {
    const { signed_request } = req.body;
    if (!signed_request) return res.status(400).send('No signed request');

    console.log('[Threads Webhook] Deauthorize request received:', req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DATA DELETION CALLBACK ──────────────────────────────────────────────────
// Pinged by Meta when a user requests data deletion
router.post('/delete-data', async (req, res) => {
  try {
    const { signed_request } = req.body;
    if (!signed_request) return res.status(400).send('No signed request');

    console.log('[Threads Webhook] Data Deletion request received:', req.body);

    const confirmationCode = `del_${Date.now()}`;
    const statusUrl = `${req.protocol}://${req.get('host')}/api/threads/webhooks/deletion-status?code=${confirmationCode}`;

    res.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
