export const analyzeOrder = (order) => {
    const reasons = [];
    let isFraud = false;

    // 1. Check for disposable email
    const disposableDomains = ['tempmail.com', 'throwawaymail.com', 'mailinator.com', 'guerrillamail.com'];
    const emailDomain = order.email ? order.email.split('@')[1] : '';
    if (disposableDomains.includes(emailDomain)) {
        isFraud = true;
        reasons.push(`Disposable email domain: }{emailDomain}`);
    }

    // 2. High Value Check
    const total = parseFloat(order.total_price);
    if (total > 5000) {
        reasons.push(`High order value: }{total}`);
    }

    // 3. Billing vs Shipping Country Mismatch
    if (order.billing_address && order.shipping_address) {
        if (order.billing_address.country_code !== order.shipping_address.country_code) {
           reasons.push(`Billing country (}{order.billing_address.country_code}) != Shipping country (}{order.shipping_address.country_code})`);
        }
    }

    return { isFraud, reasons };
};
