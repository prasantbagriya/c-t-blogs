import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getCollection, addDoc, updateDoc } from '../db.js';
import { resumeFlowWithHandle } from '../flowEngine.js';

const router = express.Router();

// 1. Create Order
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency, description, uid, customerInfo, paymentType, planId } = req.body;
    
    // Fetch Razorpay keys for this user
    const allSettings = await getCollection('razorpay_settings');
    const settings = allSettings.find(s => s.uid === uid);
    
    if (!settings || !settings.keyId || !settings.keySecret) {
      return res.status(400).json({ error: 'Razorpay keys not configured for this account.' });
    }

    const instance = new Razorpay({
      key_id: settings.keyId,
      key_secret: settings.keySecret
    });

    let result;
    if (paymentType === 'subscription') {
      if (!planId) return res.status(400).json({ error: 'Plan ID is required for subscriptions.' });
      
      result = await instance.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, 
        notes: {
          uid,
          description: description || 'Subscription'
        }
      });
    } else {
      const options = {
        amount: Math.round(parseFloat(amount) * 100), 
        currency: currency || 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: description || 'ChatWiz Payment',
          uid: uid,
          customerName: customerInfo?.name || 'Visitor'
        }
      };
      result = await instance.orders.create(options);
    }
    
    // Log the pending payment
    await addDoc('payments', {
      uid,
      orderId: result.id,
      amount: amount || 0,
      currency: currency || 'INR',
      status: 'pending',
      type: paymentType || 'one_time',
      description,
      customerInfo,
      createdAt: new Date().toISOString()
    });

    res.json({
      id: result.id,
      amount: result.amount || (amount ? Math.round(parseFloat(amount) * 100) : 0),
      currency: result.currency || currency || 'INR',
      key: settings.keyId 
    });
  } catch (error) {
    console.error('[Razorpay Order Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Verify Payment
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid } = req.body;
    
    const allSettings = await getCollection('razorpay_settings');
    const settings = allSettings.find(s => s.uid === uid);
    
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    const hmac = crypto.createHmac('sha256', settings.keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      const payments = await getCollection('payments');
      const payment = payments.find(p => p.orderId === razorpay_order_id);
      
      if (payment) {
        await updateDoc('payments', payment.id, {
          status: 'paid',
          paymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString()
        });

        // 🔄 RESUME FLOW
        if (payment.customerInfo) {
           const { visitorId, phone, source } = payment.customerInfo;
           const recipient = visitorId || phone;
           await resumeFlowWithHandle(recipient, source || 'widget', 'success');
        }
      }
      
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Webhook for WhatsApp & Manual Payments
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    // M-9 FIX: Verify Razorpay webhook signature
    const signature = req.headers['x-razorpay-signature'];
    if (signature) {
      // Try to verify against any available Razorpay key
      const allSettings = await getCollection('razorpay_settings');
      const isValid = allSettings.some(settings => {
        if (!settings.webhookSecret && !settings.keySecret) return false;
        const secret = settings.webhookSecret || settings.keySecret;
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(req.rawBody)
          .digest('hex');
        return expectedSignature === signature;
      });
      
      if (!isValid && allSettings.length > 0) {
        console.warn('[Razorpay Webhook] Invalid signature — possible spoofing attempt');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    if (event.event === 'payment.captured' || event.event === 'order.paid' || event.event === 'subscription.charged') {
      const orderId = event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id || event.payload?.subscription?.entity?.id;
      const paymentId = event.payload?.payment?.entity?.id;
      
      const payments = await getCollection('payments');
      const payment = payments.find(p => p.orderId === orderId || p.subscriptionId === orderId);
      
      if (payment) {
        await updateDoc('payments', payment.id, {
          status: 'paid',
          paymentId: paymentId,
          verifiedAt: new Date().toISOString()
        });

        // 🔄 RESUME FLOW
        if (payment.customerInfo) {
           const { visitorId, phone, source } = payment.customerInfo;
           const recipient = visitorId || phone;
           await resumeFlowWithHandle(recipient, source || 'whatsapp', 'success');
        }
      }
    } else if (event.event === 'payment.failed') {
       const orderId = event.payload?.payment?.entity?.order_id;
       const payments = await getCollection('payments');
       const payment = payments.find(p => p.orderId === orderId);
       if (payment && payment.customerInfo) {
          const { visitorId, phone, source } = payment.customerInfo;
          const recipient = visitorId || phone;
          await resumeFlowWithHandle(recipient, source || 'whatsapp', 'failure');
       }
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ status: 'error' });
  }
});

// 4. Initiate Refund
router.post('/razorpay/refund', async (req, res) => {
  try {
    const { paymentId, amount, uid } = req.body;
    
    const allSettings = await getCollection('razorpay_settings');
    const settings = allSettings.find(s => s.uid === uid);
    
    if (!settings) return res.status(404).json({ error: 'Settings not found' });

    const instance = new Razorpay({
      key_id: settings.keyId,
      key_secret: settings.keySecret
    });

    const refund = await instance.payments.refund(paymentId, {
      amount: Math.round(parseFloat(amount) * 100),
      notes: { reason: 'Requested by admin via ChatWiz Dashboard' }
    });

    const payments = await getCollection('payments');
    const payment = payments.find(p => p.paymentId === paymentId);
    if (payment) {
      await updateDoc('payments', payment.id, {
        status: 'refunded',
        refundId: refund.id,
        refundedAt: new Date().toISOString()
      });
    }

    res.json({ success: true, refund });
  } catch (error) {
    console.error('[Refund Error]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
