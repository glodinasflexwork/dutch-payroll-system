# Manual Stripe Live Setup Guide

Since you've correctly set up your environment variables in Vercel, let's create the products manually in your Stripe Dashboard for maximum security.

## 🏷️ Step 1: Create Products in Stripe Dashboard

### Go to Stripe Dashboard
1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. **Make sure you're in LIVE mode** (toggle in top left)
3. Navigate to **Products** → **Product catalog**

### Create Product 1: Starter Plan
1. Click **+ Add product**
2. **Product information:**
   - **Name**: `Dutch Payroll System - Starter`
   - **Description**: `Starter plan for Dutch Payroll System - Perfect for small businesses with up to 5 employees`
   - **Image**: (optional - you can add your logo)

3. **Pricing information:**
   - **Pricing model**: `Standard pricing`
   - **Price**: `29.00`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`

4. **Advanced settings** (click to expand):
   - **Metadata** (add these key-value pairs):
     - `plan_key`: `starter`
     - `max_employees`: `5`
     - `max_payrolls`: `12`
     - `features`: `employee_management,basic_payroll,basic_reports,email_support`

5. Click **Save product**
6. **Copy the Price ID** (starts with `price_`) - you'll need this!

### Create Product 2: Professional Plan
1. Click **+ Add product**
2. **Product information:**
   - **Name**: `Dutch Payroll System - Professional`
   - **Description**: `Professional plan for Dutch Payroll System - Ideal for growing businesses with advanced payroll needs`

3. **Pricing information:**
   - **Price**: `79.00`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`

4. **Metadata**:
   - `plan_key`: `professional`
   - `max_employees`: `50`
   - `max_payrolls`: `50`
   - `features`: `employee_management,basic_payroll,basic_reports,email_support,payroll_management,advanced_reports,api_access`

5. **Copy the Price ID**

### Create Product 3: Enterprise Plan
1. Click **+ Add product**
2. **Product information:**
   - **Name**: `Dutch Payroll System - Enterprise`
   - **Description**: `Enterprise plan for Dutch Payroll System - Unlimited employees with premium support and custom integrations`

3. **Pricing information:**
   - **Price**: `199.00`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`

4. **Metadata**:
   - `plan_key`: `enterprise`
   - `max_employees`: `unlimited`
   - `max_payrolls`: `unlimited`
   - `features`: `employee_management,basic_payroll,basic_reports,email_support,payroll_management,advanced_reports,api_access,priority_support,custom_integrations`

5. **Copy the Price ID**

## 🔗 Step 2: Set Up Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://dutch-payroll-system.vercel.app/api/webhooks/stripe`
4. **Description**: `Dutch Payroll System Webhook`
5. **Events to send** - Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

6. Click **Add endpoint**
7. **Copy the Signing secret** (starts with `whsec_`)

## 🌍 Step 3: Update Vercel Environment Variables

Add these additional environment variables in your Vercel dashboard:

```bash
# Stripe Price IDs (replace with your actual IDs from Step 1)
STRIPE_STARTER_PRICE_ID="price_your_starter_price_id"
STRIPE_PROFESSIONAL_PRICE_ID="price_your_professional_price_id"
STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id"

# Webhook Secret (from Step 2)
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_signing_secret"
```

## 📊 Step 4: Update Database Plans

You'll need to update your database plans with the Stripe IDs. You can do this by:

### Option A: Update via Database Admin (if available)
Update the `Plan` table with the corresponding `stripePriceId` values.

### Option B: Create a Simple Update Script
Create a file `update-plans.js`:

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePlans() {
  await prisma.plan.update({
    where: { name: 'Starter' },
    data: { stripePriceId: 'price_your_starter_price_id' }
  })
  
  await prisma.plan.update({
    where: { name: 'Professional' },
    data: { stripePriceId: 'price_your_professional_price_id' }
  })
  
  await prisma.plan.update({
    where: { name: 'Enterprise' },
    data: { stripePriceId: 'price_your_enterprise_price_id' }
  })
  
  console.log('Plans updated successfully!')
  await prisma.$disconnect()
}

updatePlans().catch(console.error)
```

## 🧪 Step 5: Test Your Setup

1. **Deploy your latest code** to Vercel
2. **Test webhook delivery**:
   - Go to your webhook in Stripe Dashboard
   - Click **Send test webhook**
   - Check if it reaches your endpoint successfully

3. **Test subscription flow**:
   - Visit your deployed app
   - Try creating a subscription (use test mode first if possible)
   - Monitor the Stripe Dashboard for events

## ✅ Verification Checklist

- [ ] 3 products created in Stripe Dashboard (live mode)
- [ ] All price IDs copied and added to Vercel environment variables
- [ ] Webhook endpoint configured with correct URL
- [ ] Webhook secret added to Vercel environment variables
- [ ] Database plans updated with Stripe price IDs
- [ ] Latest code deployed to Vercel
- [ ] Webhook delivery tested successfully

## 🎯 You're Ready to Go Live!

Once all steps are completed, your Dutch Payroll System will be ready to accept real payments and manage subscriptions automatically!

**Next steps:**
1. Test the complete subscription flow
2. Monitor your Stripe Dashboard for the first real transactions
3. Set up Stripe email notifications for important events
4. Consider adding analytics to track conversion rates

Your SaaS is now production-ready! 🚀

