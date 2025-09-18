# Vercel Environment Variables Setup Guide

## Important: Vercel Environment Variables vs Local .env

**Critical Understanding:**
- The `.env` file in this repository is **ONLY for local development**
- Vercel uses **its own environment variables** configured in the Vercel dashboard
- **Never put production secrets in the `.env` file** - it's committed to Git

## Setting Up Vercel Environment Variables

### 1. Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**

### 2. Required Environment Variables for Production

Configure these variables in your Vercel dashboard:

#### Core Application Settings
```
NEXTAUTH_URL = https://your-app-name.vercel.app
NODE_ENV = production
NEXTAUTH_SECRET = [generate-a-strong-32-character-secret]
```

#### Database Configuration (Neon PostgreSQL)
```
AUTH_DATABASE_URL = postgresql://neondb_owner:password@host/salarysync_auth?sslmode=require&channel_binding=require
HR_DATABASE_URL = postgresql://neondb_owner:password@host/salarysync_hr?sslmode=require&channel_binding=require
PAYROLL_DATABASE_URL = postgresql://neondb_owner:password@host/salarysync_payroll?sslmode=require&channel_binding=require
```

#### Email Configuration
```
MAILTRAP_API_TOKEN = [your-production-mailtrap-token]
MAILTRAP_API_URL = https://send.api.mailtrap.io/api/send
EMAIL_FROM = hello@yourdomain.com
EMAIL_FROM_NAME = SalarySync
```

#### Stripe Configuration (Production)
```
STRIPE_SECRET_KEY = sk_live_[your-live-secret-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_[your-live-publishable-key]
STRIPE_PRICE_ID_STARTER = price_[your-starter-price-id]
STRIPE_PRICE_ID_PROFESSIONAL = price_[your-professional-price-id]
STRIPE_PRICE_ID_ENTERPRISE = price_[your-enterprise-price-id]
```

### 3. Environment Variable Scopes

In Vercel, set the environment for each variable:
- **Production**: For live deployment
- **Preview**: For preview deployments (optional)
- **Development**: For `vercel dev` (optional)

### 4. Email Verification URL Fix

The code now automatically handles URL generation:

```javascript
// In registration route - this code is now environment-aware
const baseUrl = process.env.NEXTAUTH_URL || 
  (process.env.NODE_ENV === 'production' 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3001')
const verificationUrl = `${baseUrl}/api/auth/verify-email/${token}`
```

**How it works:**
1. **First priority**: Uses `NEXTAUTH_URL` from Vercel environment variables
2. **Fallback for production**: Uses Vercel's automatic `VERCEL_URL` variable
3. **Development fallback**: Uses `http://localhost:3001`

## Step-by-Step Vercel Setup

### Step 1: Set NEXTAUTH_URL
```
Variable Name: NEXTAUTH_URL
Value: https://your-actual-vercel-app-url.vercel.app
Environment: Production
```

### Step 2: Set Database URLs
Get these from your Neon dashboard:
```
Variable Name: AUTH_DATABASE_URL
Value: [your-neon-auth-database-connection-string]
Environment: Production
```

### Step 3: Set Email Configuration
```
Variable Name: MAILTRAP_API_TOKEN
Value: [your-mailtrap-production-token]
Environment: Production
```

### Step 4: Set Stripe Keys
Get these from your Stripe dashboard:
```
Variable Name: STRIPE_SECRET_KEY
Value: sk_live_[your-key]
Environment: Production
```

### Step 5: Generate Secure Secret
```
Variable Name: NEXTAUTH_SECRET
Value: [32+ character random string]
Environment: Production
```

## Verification Process

### After Setting Up Environment Variables:

1. **Deploy to Vercel**: Push your code to trigger deployment
2. **Test Registration**: Register a new user
3. **Check Email**: Verify the email contains correct Vercel URL
4. **Test Verification**: Click the link to ensure it works

### Expected Email URL Format:
```
https://your-app-name.vercel.app/api/auth/verify-email/[token]
```

## Security Best Practices

### ✅ Do This:
- Set all production secrets in Vercel dashboard
- Use different secrets for development and production
- Regularly rotate API keys and secrets
- Use strong, unique passwords for databases

### ❌ Never Do This:
- Put production secrets in `.env` file
- Commit secrets to Git
- Share environment variables in plain text
- Use the same secrets across environments

## Troubleshooting

### Issue: Email verification links still point to localhost
**Solution**: Ensure `NEXTAUTH_URL` is properly set in Vercel dashboard

### Issue: Database connection errors
**Solution**: Verify database URLs are correct and include SSL parameters

### Issue: Email delivery failures
**Solution**: Check Mailtrap configuration and API token validity

### Issue: Stripe webhook failures
**Solution**: Update webhook URL in Stripe dashboard to point to Vercel deployment

## Environment Variable Checklist

Before deploying to production, ensure these are set in Vercel:

- [ ] `NEXTAUTH_URL` (your Vercel app URL)
- [ ] `NEXTAUTH_SECRET` (strong random string)
- [ ] `NODE_ENV` (set to "production")
- [ ] `AUTH_DATABASE_URL` (Neon auth database)
- [ ] `HR_DATABASE_URL` (Neon HR database)
- [ ] `PAYROLL_DATABASE_URL` (Neon payroll database)
- [ ] `MAILTRAP_API_TOKEN` (production email token)
- [ ] `MAILTRAP_API_URL` (email service URL)
- [ ] `EMAIL_FROM` (your domain email)
- [ ] `EMAIL_FROM_NAME` (sender name)
- [ ] `STRIPE_SECRET_KEY` (live Stripe key)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live Stripe public key)
- [ ] All Stripe price IDs for your plans

## Local Development vs Production

### Local Development (.env file):
```bash
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
# ... other development settings
```

### Production (Vercel Dashboard):
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
# ... other production settings
```

The application will automatically use the correct environment based on where it's running.

---

**Remember**: The `.env` file is for development only. All production configuration happens in the Vercel dashboard!
