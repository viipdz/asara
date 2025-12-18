import {
    isValidAlgerianPhone,
    isValidWilaya,
    checkNameQuality,
    checkInternationalShipping
} from './algeria-data.js';

const orderHistory = new Map();

export const analyzeOrder = (order) => {
    const reasons = [];
    let isFraud = false;

    // 1. فحص البريد المؤقت
    if (order.email) {
        const disposableDomains = ['tempmail.com', 'throwawaymail.com', 'mailinator.com', 'guerrillamail.com'];
        const emailDomain = order.email.split('@')[1] || '';
        if (disposableDomains.includes(emailDomain)) {
            isFraud = true;
            reasons.push(`بريد إلكتروني مؤقت: ${emailDomain}`);
        }
    }

    // 2. فحص القيمة العالية
    const total = parseFloat(order.total_price);
    if (total > 50000) {
        reasons.push(`قيمة طلب عالية جداً: ${total} دج`);
    }

    // 3. فحص رقم الهاتف الجزائري
    const phone = order.phone || order.customer?.phone || '';
    if (phone) {
        if (!isValidAlgerianPhone(phone)) {
            isFraud = true;
            reasons.push(`رقم هاتف غير جزائري أو غير صحيح: ${phone}`);
        }
    } else {
        isFraud = true;
        reasons.push('رقم الهاتف مفقود');
    }

    // 4. فحص الولاية
    const wilaya = order.shipping_address?.province || order.shipping_address?.state || '';
    if (wilaya) {
        if (!isValidWilaya(wilaya)) {
            isFraud = true;
            reasons.push(`ولاية غير صحيحة: "${wilaya}" - قد تكون محاولة شحن دولي`);
        }
    }

    // 5. فحص جودة الاسم
    const customerName = (order.customer?.first_name || '') + ' ' + (order.customer?.last_name || '') ||
        order.shipping_address?.name || '';
    if (customerName && customerName.trim()) {
        const nameCheck = checkNameQuality(customerName);
        if (!nameCheck.valid) {
            isFraud = true;
            reasons.push(`اسم مشبوه: ${nameCheck.reason}`);
        }
    }

    // 6. فحص محاولات الشحن الدولي
    const address = order.shipping_address?.address1 || '';
    const internationalCheck = checkInternationalShipping(address, wilaya);
    if (internationalCheck.suspicious) {
        isFraud = true;
        reasons.push(internationalCheck.reason);
    }

    // 7. فحص التكرار (طلبات متعددة من نفس الرقم)
    if (phone) {
        const phoneKey = phone.replace(/[\s\-\(\)]/g, '');
        const today = new Date().toDateString();
        const historyKey = `${phoneKey}_${today}`;

        if (orderHistory.has(historyKey)) {
            const count = orderHistory.get(historyKey);
            orderHistory.set(historyKey, count + 1);

            if (count >= 3) {
                isFraud = true;
                reasons.push(`طلبات متكررة: ${count + 1} طلبات من نفس الرقم اليوم`);
            } else if (count >= 2) {
                reasons.push(`تحذير: ${count + 1} طلبات من نفس الرقم اليوم`);
            }
        } else {
            orderHistory.set(historyKey, 1);
        }
    }

    // 8. فحص العنوان المتكرر
    if (address) {
        const addressKey = address.toLowerCase().replace(/\s/g, '');
        const today = new Date().toDateString();
        const addrHistoryKey = `addr_${addressKey}_${today}`;

        if (orderHistory.has(addrHistoryKey)) {
            const count = orderHistory.get(addrHistoryKey);
            orderHistory.set(addrHistoryKey, count + 1);

            if (count >= 5) {
                isFraud = true;
                reasons.push(`عنوان متكرر: ${count + 1} طلبات لنفس العنوان اليوم`);
            }
        } else {
            orderHistory.set(addrHistoryKey, 1);
        }
    }

    // 9. فحص الطلبات السريعة المتتالية
    if (phone) {
        const phoneKey = phone.replace(/[\s\-\(\)]/g, '');
        const lastOrderTime = orderHistory.get(`time_${phoneKey}`);
        const now = Date.now();

        if (lastOrderTime && (now - lastOrderTime) < 60000) {
            isFraud = true;
            reasons.push('طلبات متتالية بسرعة مشبوهة (أقل من دقيقة)');
        }

        orderHistory.set(`time_${phoneKey}`, now);
    }

    return { isFraud, reasons };
};

export function cleanOldHistory() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    for (const [key, value] of orderHistory.entries()) {
        if (key.includes(yesterdayStr)) {
            orderHistory.delete(key);
        }
    }
}
