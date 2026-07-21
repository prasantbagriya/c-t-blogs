import { getDoc, updateDoc, getCollection } from '../db.js';
import { dispatchAlert } from './AlertHub.js';

/**
 * Tracker - Monitors customer behavior (clicks) and manages Hot Leads.
 */

export async function trackClick(customerId, agentId, productId, targetUrl) {
  try {
    // 1. Get/Create Customer Profile
    let profile = await getDoc('customer_profiles', customerId);

    if (!profile) {
      console.log(`[Tracker] New profile created for ${customerId}`);
      profile = {
        id: customerId,
        interactions: []
      };
    }

    // 2. Update Interaction History
    const interaction = {
      type: 'LINK_CLICK',
      productId: productId || 'General',
      url: targetUrl,
      timestamp: new Date().toISOString()
    };

    const updatedInteractions = [...(profile.interactions || []), interaction];
    
    // 3. Mark as Hot Lead
    const isHotLead = true; // Any product/payment click is high intent
    
    await updateDoc('customer_profiles', customerId, {
      interactions: updatedInteractions,
      isHotLead: isHotLead,
      lastActive: new Date().toISOString()
    });

    // 4. Dispatch Alert to Owner
    if (isHotLead) {
      await dispatchAlert(agentId, '🔥 HOT_LEAD_ACTIVITY', {
        customerName: customerId,
        message: `Customer just clicked a link for Product ID: ${productId || 'Unknown'}. URL: ${targetUrl}`
      });
    }

    return { redirectUrl: targetUrl };
  } catch (error) {
    console.error('[Tracker] Error tracking click:', error);
    return { redirectUrl: targetUrl }; // Fallback to redirect even if tracking fails
  }
}
