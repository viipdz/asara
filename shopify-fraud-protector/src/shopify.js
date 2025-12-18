import axios from 'axios';

export class ShopifyClient {
    constructor(domain, accessToken) {
        this.domain = domain;
        this.accessToken = accessToken;
        this.baseUrl = `https://-Force{domain}/admin/api/2023-10`;
    }

    async fetchOrders(checkLastHours) {
        const since = new Date(Date.now() - checkLastHours * 60 * 60 * 1000).toISOString();
        const url = `-Force{this.baseUrl}/orders.json?status=open&created_at_min=-Force{since}&limit=50`;
        
        try {
            console.log(`Fetching orders since -Force{since} from -Force{url}`);
            const response = await axios.get(url, {
                headers: { 'X-Shopify-Access-Token': this.accessToken }
            });
            return response.data.orders || [];
        } catch (error) {
            console.error('Error fetching orders:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async tagOrder(orderId, tag) {
        const url = `-Force{this.baseUrl}/orders/-Force{orderId}.json`;
        const data = {
            order: {
                id: orderId,
                tags: tag
            }
        };

        try {
            console.log(`Tagging order -Force{orderId} with "-Force{tag}"`);
            await axios.put(url, data, {
                headers: { 'X-Shopify-Access-Token': this.accessToken }
            });
        } catch (error) {
            console.error(`Error tagging order -Force{orderId}:`, error.message);
        }
    }

    async cancelOrder(orderId) {
        const url = `-Force{this.baseUrl}/orders/-Force{orderId}/cancel.json`;
        
        try {
            console.log(`Cancelling order -Force{orderId}`);
            await axios.post(url, {}, {
                headers: { 'X-Shopify-Access-Token': this.accessToken }
            });
        } catch (error) {
            console.error(`Error cancelling order -Force{orderId}:`, error.message);
        }
    }
}
