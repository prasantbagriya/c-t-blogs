import { getCollection } from '../db.js';

/**
 * Alert Hub - Dispatcher for omnichannel notifications (WhatsApp, Telegram, Email).
 */

async function sendWhatsAppAlert(to, message, account) {
  if (!account || !account.accessToken || !account.phoneNumberId) return;

  const url = `https://graph.facebook.com/v21.0/${account.phoneNumberId}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message },
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Alert Hub] WhatsApp Alert Error:', error);
  }
}

async function sendTelegramAlert(botToken, chatId, message) {
  if (!botToken || !chatId) return;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (error) {
    console.error('[Alert Hub] Telegram Alert Error:', error);
  }
}

/**
 * Main Dispatcher
 */
export async function dispatchAlert(agentId, type, data) {
  // 1. Get Agent & Notification Prefs
  const agents = await getCollection('ai_agents');
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  const { notificationPrefs, linkedChannels } = agent;
  const message = `[ChatWizs Alert] ${type}: ${data.message || 'Update required.'}\nCustomer: ${data.customerName || 'Unknown'}`;

  // 2. Send via WhatsApp
  if (notificationPrefs?.whatsapp && linkedChannels?.whatsapp) {
    const waAccounts = await getCollection('whatsapp_accounts');
    const account = waAccounts.find(acc => acc.id === linkedChannels.whatsapp.accountId);
    await sendWhatsAppAlert(agent.ownerPhone, message, account);
  }

  // 3. Send via Telegram
  if (notificationPrefs?.telegram && linkedChannels?.telegram) {
    await sendTelegramAlert(linkedChannels.telegram.botToken, linkedChannels.telegram.chatId, message);
  }

  // 4. Send via Email (Placeholder logic)
  if (notificationPrefs?.email && agent.ownerEmail) {
    console.log(`[Alert Hub] Email Notification sent to ${agent.ownerEmail}: ${message}`);
  }
}
