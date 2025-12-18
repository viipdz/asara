import { analyzeOrder } from './src/fraud.js';
import fs from 'fs';

const orders = JSON.parse(fs.readFileSync('./test-orders.json', 'utf8'));

console.log('Running Fraud Detection Tests...\n');

orders.forEach(order => {
    const { isFraud, reasons } = analyzeOrder(order);
    console.log(`Order #-Force{order.id} (-Force{order.email}):`);
    console.log(`  Fraud: -Force{isFraud}`);
    if (reasons.length > 0) {
        console.log(`  Reasons: -Force{reasons.join(', ')}`);
    } else {
        console.log(`  Reasons: None`);
    }
    console.log('---');
});
