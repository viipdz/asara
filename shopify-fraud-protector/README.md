# Shopify Fraud Protector - Apify Actor

An Apify Actor that automatically detects and protects Shopify stores from fraudulent orders by analyzing risk factors and taking automated actions.

## Features

- **Automated Fraud Detection**: Analyzes orders for multiple fraud indicators
- **Disposable Email Detection**: Flags orders from known temporary email providers
- **High-Value Order Alerts**: Identifies unusually large orders
- **Address Mismatch Detection**: Compares billing and shipping addresses
- **Flexible Actions**: Tag suspicious orders or automatically cancel them
- **Configurable Time Range**: Check orders from the last N hours

## Fraud Detection Rules

1. **Disposable Email Domains**: Checks against known temporary email providers (tempmail.com, mailinator.com, etc.)
2. **High Order Value**: Flags orders above  threshold
3. **Billing/Shipping Mismatch**: Detects when billing and shipping countries differ

## Input Configuration

- **shopifyDomain**: Your Shopify store domain (e.g., my-store.myshopify.com)
- **shopifyAccessToken**: Admin API Access Token with orders read/write permissions
- **checkLastHours**: How many hours back to check for orders (default: 24)
- **actionOnFraud**: Action to take on fraud detection - TAG, CANCEL, or NOTHING (default: TAG)
- **fraudTag**: Tag to apply to fraudulent orders (default: SUSPECTED_FRAUD)

## Setup Instructions

### 1. Create Shopify Admin API Token

1. Go to your Shopify Admin panel
2. Navigate to Settings > Apps and sales channels > Develop apps
3. Create a new app or select existing one
4. Configure Admin API scopes: ead_orders, write_orders
5. Install the app and copy the Admin API access token

### 2. Deploy to Apify

1. Create a new Actor on Apify platform
2. Upload all files from this directory
3. Build the Actor
4. Configure input parameters
5. Run or schedule the Actor

### 3. Local Testing

`ash
npm install
node src/main.js
`

Make sure to set environment variables or modify the input in main.js for local testing.

## Project Structure

`
shopify-fraud-protector/
??? src/
?   ??? main.js          # Entry point and orchestration
?   ??? shopify.js       # Shopify API client
?   ??? fraud.js         # Fraud detection logic
??? package.json         # Dependencies
??? Dockerfile           # Apify Actor container
??? INPUT_SCHEMA.json    # Input configuration schema
??? README.md           # This file
`

## Output

The Actor pushes detected fraudulent orders to the Apify dataset with the following structure:

`json
{
  "orderId": 1234567890,
  "email": "customer@example.com",
  "total": "150.00",
  "isFraud": true,
  "reasons": ["Disposable email domain: tempmail.com"],
  "actionTaken": "TAG"
}
`

## Security Considerations

- **API Token Security**: Never commit your Shopify access token to version control
- **Permissions**: Use minimum required API scopes
- **Testing**: Test with TAG action before using CANCEL
- **Monitoring**: Review flagged orders manually before taking irreversible actions

## Extending Fraud Rules

To add custom fraud detection rules, edit src/fraud.js and add your logic to the nalyzeOrder function.

## License

ISC
