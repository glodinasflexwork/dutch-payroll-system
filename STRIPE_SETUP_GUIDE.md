# Stripe Production Setup Guide for Dutch Payroll System

This guide will help you configure your existing Stripe account for the Dutch Payroll System.

## 📋 Prerequisites

- ✅ Existing Stripe account
- ✅ Access to Stripe Dashboard
- ✅ Dutch Payroll System codebase

## 🔑 Step 1: Get Your Stripe API Keys

### Test Mode Keys (for development/testing)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test mode** (toggle in top left)
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Live Mode Keys (for production)
1. Switch to **Live mode** in Stripe Dashboard
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

## 🏷️ Step 2: Create Products and Prices

You have two options:

### Option A: Use Our Automated Script (Recommended)
1. Update your `.env` file with test keys
2. Run: `npm run setup-stripe-products`
3. Copy the generated price IDs to your `.env`

### Option B: Manual Setup in Stripe Dashboard

#### Starter Plan
- **Product Name**: Dutch Payroll System - Starter
- **Price**: €29.00 EUR / month
- **Metadata**:
  - `plan_key`: starter
  - `max_employees`: 5
  - `max_payrolls`: 12

#### Professional Plan
- **Product Name**: Dutch Payroll System - Professional  
- **Price**: €79.00 EUR / month
- **Metadata**:
  - `plan_key`: professional
  - `max_employees`: 50
  - `max_payrolls`: 50

#### Enterprise Plan
- **Product Name**: Dutch Payroll System - Enterprise
- **Price**: €199.00 EUR / month
- **Metadata**:
  - `plan_key`: enterprise
  - `max_employees`: unlimited
  - `max_payrolls`: unlimited

## 🔗 Step 3: Set Up Webhook Endpoint

### 3.1 Create Webhook Endpoint
1. Go to [Webhooks](https://dashboard.stripe.com/webhooks) in Stripe Dashboard
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

### 3.2 Get Webhook Secret
1. Click on your created webhook
2. Copy the **Signing secret** (starts with `whsec_`)

## 🌍 Step 4: Configure Environment Variables

### For Development (.env)
```bash
# Stripe Test Configuration
STRIPE_SECRET_KEY="sk_test_your_test_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_test_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Stripe Price IDs (from Step 2)
STRIPE_STARTER_PRICE_ID="price_test_starter_id"
STRIPE_PROFESSIONAL_PRICE_ID="price_test_professional_id"
STRIPE_ENTERPRISE_PRICE_ID="price_test_enterprise_id"
```

### For Production (Vercel/Deployment Platform)
```bash
# Stripe Live Configuration
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_live_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_live_webhook_secret"

# Stripe Live Price IDs
STRIPE_STARTER_PRICE_ID="price_live_starter_id"
STRIPE_PROFESSIONAL_PRICE_ID="price_live_professional_id"
STRIPE_ENTERPRISE_PRICE_ID="price_live_enterprise_id"
```

## 🧪 Step 5: Test the Integration

### 5.1 Test Subscription Creation
1. Start your development server: `npm run dev`
2. Navigate to `/dashboard/billing` or pricing page
3. Try subscribing to a plan using [Stripe test cards](https://stripe.com/docs/testing#cards):
   - **Success**: `4242424242424242`
   - **Decline**: `4000000000000002`

### 5.2 Test Webhooks Locally
1. Install Stripe CLI: `stripe login`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook secret from CLI output
4. Update your `.env` with the CLI webhook secret
5. Test subscription events in Stripe Dashboard

## 🚀 Step 6: Deploy to Production

### 6.1 Update Production Environment Variables
- Set all live Stripe keys in your deployment platform (Vercel, etc.)
- Ensure webhook URL points to your production domain

### 6.2 Update Webhook Endpoint
- Change webhook URL from localhost to your production domain
- Test webhook delivery in Stripe Dashboard

### 6.3 Go Live Checklist
- [ ] Live API keys configured
- [ ] Products and prices created in live mode
- [ ] Webhook endpoint configured and tested
- [ ] Test transactions completed successfully
- [ ] Customer portal accessible
- [ ] Invoice generation working

## 🛡️ Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** (already implemented)
4. **Monitor failed payments** and subscription changes
5. **Set up Stripe alerts** for important events

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Review webhook delivery attempts
3. Monitor application logs for errors
4. Test with Stripe CLI for local development

## 🎯 Next Steps After Setup

1. **Marketing Integration**: Add analytics tracking
2. **Email Notifications**: Set up payment confirmations
3. **Customer Support**: Implement billing support flows
4. **Monitoring**: Set up alerts for failed payments
5. **Compliance**: Ensure GDPR/privacy compliance

---

**Ready to configure your Stripe account? Let's start with Step 1!**

