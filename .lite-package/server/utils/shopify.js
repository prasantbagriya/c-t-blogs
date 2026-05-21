import { getCollection, updateDoc, setDoc, addDoc } from '../db.js';

/**
 * Generic fetcher for Shopify Admin API
 */
async function callShopify(endpoint, shopName, accessToken) {
  const cleanShopName = shopName.replace('https://', '').replace('http://', '').replace('.myshopify.com', '');
  const url = `https://${cleanShopName}.myshopify.com/admin/api/2024-04/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors || `Shopify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Synchronize products from Shopify to local database
 */
export async function syncShopifyProducts(uid) {
  try {
    const settings = await getShopifySettings(uid);
    if (!settings) throw new Error('Shopify not connected');

    console.log(`[Shopify] Syncing products for user ${uid}...`);
    const data = await callShopify('products.json?limit=250', settings.shopName, settings.accessToken);
    const products = data.products || [];

    // Batch update products
    const existingProducts = await getCollection('shopify_products');
    const updatedProducts = [...existingProducts.filter(p => p.uid !== uid)];
    
    for (const p of products) {
      updatedProducts.push({
        uid,
        shopifyId: p.id,
        title: p.title,
        description: p.body_html,
        vendor: p.vendor,
        productType: p.product_type,
        handle: p.handle,
        status: p.status,
        images: p.images.map(img => img.src),
        variants: p.variants.map(v => ({
          id: v.id,
          title: v.title,
          price: v.price,
          sku: v.sku,
          inventory: v.inventory_quantity
        })),
        updatedAt: new Date().toISOString(),
        id: `sh_p_${p.id}`
      });
    }
    
    // Save the entire filtered + new products list
    const { writeCollection } = await import('../db.js');
    await writeCollection('shopify_products', updatedProducts);

    console.log(`[Shopify] Successfully synced ${products.length} products for ${uid}`);
    return { success: true, count: products.length };
  } catch (error) {
    console.error('[Shopify Sync Error]', error);
    throw error;
  }
}

/**
 * Synchronize recent orders from Shopify
 */
export async function syncShopifyOrders(uid) {
  try {
    const settings = await getShopifySettings(uid);
    if (!settings) throw new Error('Shopify not connected');

    console.log(`[Shopify] Syncing orders for user ${uid}...`);
    const data = await callShopify('orders.json?status=any&limit=50', settings.shopName, settings.accessToken);
    const orders = data.orders || [];

    // Batch update orders
    const existingOrders = await getCollection('shopify_orders');
    const updatedOrders = [...existingOrders.filter(o => o.uid !== uid)];

    for (const o of orders) {
      updatedOrders.push({
        uid,
        shopifyId: o.id,
        orderNumber: o.name,
        email: o.email,
        phone: o.phone,
        totalPrice: o.total_price,
        currency: o.currency,
        financialStatus: o.financial_status,
        fulfillmentStatus: o.fulfillment_status,
        customerName: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
        items: o.line_items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        orderUrl: o.order_status_url,
        createdAt: o.created_at,
        updatedAt: new Date().toISOString(),
        id: `sh_o_${o.id}`
      });
    }

    const { writeCollection } = await import('../db.js');
    await writeCollection('shopify_orders', updatedOrders);

    return { success: true, count: orders.length };
  } catch (error) {
    console.error('[Shopify Order Sync Error]', error);
    throw error;
  }
}

/**
 * Helper to get shopify settings for a user
 */
async function getShopifySettings(uid) {
  const allSettings = await getCollection('shopify_settings');
  return allSettings.find(s => s.uid === uid);
}
