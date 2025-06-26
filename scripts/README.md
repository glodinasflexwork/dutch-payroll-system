# Scripts Directory

This directory contains utility scripts for the Dutch Payroll System.

## Available Scripts

### setup-stripe.js

Creates Stripe products and prices for the SaaS subscription plans.

**Prerequisites:**
- Node.js installed
- Stripe package installed (`npm install stripe`)
- Stripe secret key set as environment variable

**Usage:**
```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY="sk_test_..." # or sk_live_...

# Run the setup script
node scripts/setup-stripe.js
```

**What it creates:**
- **Starter Plan**: €29/month (up to 10 employees)
- **Professional Plan**: €79/month (up to 50 employees)  
- **Enterprise Plan**: €199/month (unlimited employees)

**After running:**
1. Copy the generated Price IDs to your Vercel environment variables
2. Update your database Plan records with the Stripe IDs
3. Test the subscription flow

## Environment Variables Required

- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with sk_test_ or sk_live_)

## Notes

- Always test with Stripe test keys first before using live keys
- The script is idempotent - you can run it multiple times safely
- Check your Stripe Dashboard to verify products were created correctly

