import express from 'express';
import crypto from 'crypto';
import { getCollection, addDoc, updateDoc, setDoc } from '../db.js';

const router = express.Router();

const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET = process.env.SHOPIFY_API_SECRET;
const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI || 'https://your-domain.com/api/shopify/callback';
const SCOPES = 'read_products,read_orders,read_customers,read_inventory';

/**
 * 1. START OAUTH
 * Redirects the user to Shopify to authorize the app
 */
router.get('/auth', async (req, res) => {
  const { shop, uid } = req.query;
  
  if (!shop || !uid) {
    return res.status(400).send('Missing shop or uid parameter');
  }

  // Sanitize shop domain
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  if (!shopRegex.test(shop)) {
    return res.status(400).send('Invalid shop domain. Use your-store.myshopify.com');
  }

  // Create a state (nonce) to prevent CSRF
  const state = crypto.randomBytes(16).toString('hex');
  
  // Temporary store state to verify in callback
  // In production, use a session or Redis. For now, we'll store it in a temp collection
  await addDoc('shopify_auth_states', { state, uid, shop, createdAt: new Date().toISOString() });

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${API_KEY}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${state}`;
  
  res.redirect(installUrl);
});

/**
 * 2. OAUTH CALLBACK
 * Receives the code from Shopify and exchanges it for a permanent access token
 */
router.get('/callback', async (req, res) => {
  const { shop, code, state, hmac } = req.query;

  // 1. Verify HMAC (Security)
  const map = Object.assign({}, req.query);
  delete map['hmac'];
  const message = Object.keys(map).sort().map(key => `${key}=${map[key]}`).join('&');
  const generatedHmac = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');

  if (generatedHmac !== hmac) {
    return res.status(400).send('HMAC validation failed');
  }

  // 2. Verify State
  const authStates = await getCollection('shopify_auth_states');
  const savedState = authStates.find(s => s.state === state);
  if (!savedState) {
    return res.status(400).send('State validation failed');
  }

  try {
    // 3. Exchange Code for Access Token
    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET,
        code
      })
    });

    const tokenData = await accessTokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Failed to retrieve access token');
    }

    // 4. Save Connection Settings
    const shopSettings = await getCollection('shopify_settings');
    const existing = shopSettings.find(s => s.shopName === shop && s.uid === savedState.uid);

    const config = {
      uid: savedState.uid,
      shopName: shop,
      accessToken: accessToken,
      status: 'connected',
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await updateDoc('shopify_settings', existing.id, config);
    } else {
      await addDoc('shopify_settings', { ...config, createdAt: new Date().toISOString() });
    }

    // 5. Cleanup
    // (Optional: remove auth state)

    // Redirect back to Dashboard
    res.send(`
      <html>
        <head><title>Success</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
          <h2 style="color:#10b981;">✅ Shopify Connected Successfully!</h2>
          <p>You can close this window now.</p>
          <script>
            setTimeout(() => {
              window.opener.postMessage('shopify-connected', '*');
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('[Shopify OAuth Error]', error);
    res.status(500).send('Internal Server Error during installation');
  }
});

/**
 * 3. MANUAL LINK (Custom App)
 * Saves the provided access token directly
 */
router.post('/manual-link', async (req, res) => {
  console.log('[ShopifyManual] Request received:', req.body);
  const { shop, accessToken, apiKey, uid } = req.body;

  if (!shop || !accessToken || !uid) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    let shopName = shop.toLowerCase().replace('https://', '').replace('http://', '').split('/')[0].trim();
    if (!shopName.includes('.myshopify.com')) shopName += '.myshopify.com';

    const shopSettings = await getCollection('shopify_settings');
    const existing = shopSettings.find(s => s.shopName === shopName && s.uid === uid);

    const config = {
      uid,
      shopName,
      accessToken,
      apiKey: apiKey || '',
      status: 'connected',
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await updateDoc('shopify_settings', existing.id, config);
    } else {
      await addDoc('shopify_settings', { ...config, createdAt: new Date().toISOString() });
    }

    res.json({ success: true, message: 'Shopify linked manually!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. SYNC DATA
 * Fetches products and orders from Shopify
 */
router.post('/sync', async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });

  try {
    const { syncShopifyProducts, syncShopifyOrders } = await import('../utils/shopify.js');
    const pResult = await syncShopifyProducts(uid);
    const oResult = await syncShopifyOrders(uid);
    res.json({ success: true, products: pResult.count, orders: oResult.count });
  } catch (error) {
    console.error('[ShopifySync] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
