
import { Actor } from 'apify';
import { ShopifyClient } from './shopify.js';
import { analyzeOrder } from './fraud-enhanced.js';

await Actor.init();

const input = await Actor.getInput() || {};
const {
    shopifyDomain,
    shopifyAccessToken,
    checkLastHours = 24,
    actionOnFraud = 'TAG',
    fraudTag = 'SUSPECTED_FRAUD'
} = input;

if (!shopifyDomain || !shopifyAccessToken) {
    throw new Error('Missing shopifyDomain or shopifyAccessToken in input');
}

const client = new ShopifyClient(shopifyDomain, shopifyAccessToken);

try {
    const orders = await client.fetchOrders(checkLastHours);
    console.log(`Found ${orders.length} orders to analyze.`);

    for (const order of orders) {
        const { isFraud, reasons } = analyzeOrder(order);

        if (isFraud || reasons.length > 0) {
            console.log(`Order ${order.id} flagged. Reasons: ${reasons.join(', ')}`);
            await Actor.pushData({
                orderId: order.id,
                customerName: (order.customer?.first_name || '') + ' ' + (order.customer?.last_name || ''),
                phone: order.phone || order.customer?.phone,
                email: order.email,
                wilaya: order.shipping_address?.province || order.shipping_address?.state,
                total: order.total_price,
                isFraud,
                reasons,
                actionTaken: isFraud ? actionOnFraud : 'NONE'
            });

            if (isFraud) {
                if (actionOnFraud === 'TAG') {
                    await client.tagOrder(order.id, fraudTag);
                } else if (actionOnFraud === 'CANCEL') {
                    await client.cancelOrder(order.id);
                }
            }
        }
    }

    console.log('Analysis complete!');
} catch (error) {
    console.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
