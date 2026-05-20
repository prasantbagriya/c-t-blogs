import express from 'express';
import { addDoc, getCollection, updateDoc, getDoc, deleteDoc } from '../db.js';
import { processFlowMessage, sendWhatsAppMessage } from '../flowEngine.js';
import { suggestReply, detectOptOut } from '../ai.js';
import { dispatchAlert } from '../utils/AlertHub.js';

const router = express.Router();
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'chatwiz_secure_token_2026';

/**
 * Utility to send WhatsApp message
 */
async function sendWhatsAppResponse(to, text, account) {
  try {
    await sendWhatsAppMessage(to, text, account);
  } catch (err) {
    console.error('[Webhook] Send Response Error:', err);
  }
}

async function handleAIResponse(agent, customerMsg, account, source) {
  const { from, text } = customerMsg;
  const now = Date.now();
  const allMessages = await getCollection('messages');
  const chatHistory = allMessages
    .filter(m => (m.whatsappAccountId === account.id || m.instagramAccountId === account.id) && m.chatId === from)
    .filter(m => (now - new Date(m.timestamp).getTime()) < (10 * 60 * 1000))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-10)
    .map(m => ({ sender: m.sender, text: m.text }));

  const context = {
    businessName: agent.name,
    description: agent.description,
    website: agent.websiteUrl,
    social: agent.socialHandle,
    knowledgeBase: agent.knowledgeBase,
    persona: agent.persona
  };

  try {
    const shopifyProducts = await getCollection('shopify_products');
    const userProducts = shopifyProducts.filter(p => p.uid === account.uid);
    if (userProducts.length > 0) {
      const catalogSummary = userProducts.slice(0, 10).map(p => `- ${p.title}: ${p.variants[0]?.price || 'N/A'}`).join('\n');
      context.knowledgeBase += `\n\n[Shopify Catalog Info]\n${catalogSummary}`;
    }
  } catch (e) { console.warn('[AI] Shopify context failed:', e.message); }

  const aiReply = await suggestReply(chatHistory, context);

  if (aiReply.includes('[HANDOVER_REQUIRED]')) {
    const cleanReply = aiReply.replace('[HANDOVER_REQUIRED]', '').trim();
    if (cleanReply) await sendWhatsAppResponse(from, cleanReply, account);

    const ticketId = `tk-${Date.now()}`;
    await addDoc('tickets', {
      id: ticketId,
      agentId: agent.id,
      customerName: from,
      lastQuery: text,
      status: 'Open',
      timestamp: new Date().toISOString()
    });

    await dispatchAlert(agent.id, 'URGENT_HANDOVER', {
      customerName: from,
      message: `AI requested handover for query: "${text}"`
    });
    return;
  }

  if (aiReply && source === 'whatsapp') {
    await sendWhatsAppResponse(from, aiReply, account);
    await addDoc('messages', {
      uid: account.uid,
      sender: 'agent',
      senderName: agent.name,
      text: aiReply,
      source: 'whatsapp',
      whatsappAccountId: account.id,
      chatId: from,
      timestamp: new Date().toISOString()
    });
  }
}

// Meta Webhook Verification (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook] VERIFIED');
      return res.status(200).send(challenge);
    }
  }
  res.sendStatus(403);
});

// Meta Webhook Event Handler (POST)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        console.log(`[Webhook] Processing Entry: ${entry.id}`);
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // 1. Handle Statuses
          if (value.statuses) {
            for (const statusObj of value.statuses) {
              const { id: messageId, status, recipient_id: recipient, timestamp } = statusObj;
              console.log(`[Webhook] Status: ${status} for msg ${messageId}`);
              const allMessages = await getCollection('messages');
              const msg = allMessages.find(m => m.messageId === messageId);
              if (msg) {
                await updateDoc('messages', msg.id, { 
                  deliveryStatus: status, 
                  statusUpdatedAt: new Date(parseInt(timestamp) * 1000).toISOString() 
                });
              }
            }
          }

          // 2. Handle Messages
          if (value.messages) {
            for (const message of value.messages) {
              const from = message.from;
              const wabaId = entry.id;
              console.log(`[Webhook] Message from ${from} (${message.type})`);

              let text = message.text?.body;
              let interactiveId = null;

              if (message.type === 'interactive') {
                const i = message.interactive;
                if (i.type === 'button_reply') { text = i.button_reply.title; interactiveId = i.button_reply.id; }
                else if (i.type === 'list_reply') { text = i.list_reply.title; interactiveId = i.list_reply.id; }
                else if (i.type === 'nfm_reply') {
                  try {
                    const data = JSON.parse(i.nfm_reply.response_json);
                    text = `📝 Form: ${Object.values(data).join(', ')}`;
                    interactiveId = 'flow_submit';
                  } catch (e) { text = "Flow Submit"; }
                }
              } else if (message.type === 'location') {
                text = `📍 Location: ${message.location.latitude}, ${message.location.longitude}`;
                interactiveId = 'location_received';
              }

              if (text || interactiveId) {
                const accounts = await getCollection('whatsapp_accounts');
                const account = accounts.find(acc => acc.wabaId === String(wabaId));
                if (account) {
                  const submissionData = (message.type === 'interactive' && message.interactive.type === 'nfm_reply') 
                    ? JSON.parse(message.interactive.nfm_reply.response_json) : null;

                  await addDoc('messages', {
                    uid: account.uid,
                    sender: from,
                    senderName: from,
                    text,
                    source: 'whatsapp',
                    whatsappAccountId: account.id,
                    chatId: from,
                    timestamp: new Date().toISOString(),
                    messageId: message.id,
                    submissionData
                  });

                  console.log(`[Webhook] Routing to FlowEngine: ${text}`);
                  const handled = await processFlowMessage({ 
                    from, text, interactiveId, submissionData, messageId: message.id,
                    location: message.type === 'location' ? message.location : null
                  }, account);

                  if (!handled) {
                    const agents = await getCollection('ai_agents');
                    const agent = agents.find(a => a.uid === account.uid && a.isActive && a.linkedChannels?.whatsapp?.accountId === account.id);
                    if (agent) {
                      console.log(`[Webhook] AI Fallback: ${agent.name}`);
                      await handleAIResponse(agent, { from, text, interactiveId }, account, 'whatsapp');
                    }
                  }
                }
              }
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    res.sendStatus(404);
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.sendStatus(500);
  }
});

// Shopify Webhook
router.post('/shopify', async (req, res) => {
  try {
    const topic = req.headers['x-shopify-topic'];
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const data = req.body;
    const shopSettings = await getCollection('shopify_settings');
    const setting = shopSettings.find(s => shopDomain.includes(s.shopName));
    if (!setting) return res.sendStatus(404);

    const automations = await getCollection('automations');
    const rule = automations.find(a => a.uid === setting.uid && a.event === topic && a.isActive);
    if (rule) {
      const accounts = await getCollection('whatsapp_accounts');
      const account = accounts.find(acc => acc.uid === setting.uid);
      const recipient = data.phone || data.customer?.phone || data.billing_address?.phone;
      if (account && recipient) {
        const cleanRecipient = recipient.replace(/\D/g, '');
        await sendWhatsAppMessage(cleanRecipient, '', account, {
          template: { name: rule.templateName, language: 'en_US', components: [] }
        });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('[Shopify Webhook Error]', err);
    res.sendStatus(500);
  }
});

// ── THREADS WEBHOOK: User Deauthorized (Uninstall) ───────────────────────────
// Meta calls this when a user disconnects your Threads app
router.post('/threads/webhooks/deauthorize', async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log('[Threads Webhook] User deauthorized:', user_id);
    if (user_id) {
      const accounts = await getCollection('threads_accounts');
      const account = accounts.find(a => a.threadsId === String(user_id));
      if (account) {
        await updateDoc('threads_accounts', account.id, { status: 'deauthorized', deauthorizedAt: new Date().toISOString() });
        console.log(`[Threads Webhook] Marked account ${account.id} as deauthorized`);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('[Threads Deauthorize Webhook] Error:', err);
    res.sendStatus(500);
  }
});

// ── THREADS WEBHOOK: User Data Deletion Request ───────────────────────────────
// Meta calls this when a user requests deletion of their data (GDPR)
router.post('/threads/webhooks/delete-data', async (req, res) => {
  try {
    const { user_id } = req.body;
    console.log('[Threads Webhook] Data deletion requested for user:', user_id);
    if (user_id) {
      const accounts = await getCollection('threads_accounts');
      const account = accounts.find(a => a.threadsId === String(user_id));
      if (account) {
        await deleteDoc('threads_accounts', account.id);
        console.log(`[Threads Webhook] Deleted account ${account.id} for user ${user_id}`);
      }
    }
    // Return confirmation URL as required by Meta
    res.status(200).json({ 
      url: `${process.env.APP_URL || 'https://chatwizs.com'}/data-deletion-status`,
      confirmation_code: `threads_del_${user_id}_${Date.now()}`
    });
  } catch (err) {
    console.error('[Threads Delete Webhook] Error:', err);
    res.sendStatus(500);
  }
});

export default router;
