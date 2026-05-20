// Native fetch is used (Node 20+)

/**
 * Send Transactional SMS using Brevo (SendinBlue) API
 * @param {string} recipient - Mobile number with country code (e.g., 919876543210)
 * @param {string} content - Message content
 * @param {string} sender - Sender name (Max 11 chars)
 */
export async function sendSMS(recipient, content, sender = 'ChatWiz') {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('[SMS] CRITICAL: BREVO_API_KEY is missing in .env');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: sender.substring(0, 11),
        recipient: recipient.startsWith('+') ? recipient.substring(1) : recipient,
        content: content,
        type: 'transactional'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[SMS] Brevo API Error:', data);
      return { success: false, error: data.message || 'Failed to send SMS' };
    }

    console.log(`[SMS] Sent successfully to ${recipient}. MessageID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };

  } catch (error) {
    console.error('[SMS] Network Error:', error);
    return { success: false, error: error.message };
  }
}
