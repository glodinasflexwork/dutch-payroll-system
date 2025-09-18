# SalarySync Deployment Guide

## Environment Variables Configuration

### Development Environment

For local development, ensure your `.env` file contains:

```bash
# Development Configuration
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development

# Database URLs (Neon PostgreSQL)
AUTH_DATABASE_URL=postgresql://...
HR_DATABASE_URL=postgresql://...
PAYROLL_DATABASE_URL=postgresql://...

# Email Configuration (Mailtrap)
MAILTRAP_API_TOKEN=your-mailtrap-token
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=hello@salarysync.online
EMAIL_FROM_NAME=SalarySync

# Authentication
NEXTAUTH_SECRET=your-development-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### Production Environment (Vercel)

In your Vercel dashboard, configure these environment variables:

#### Required Variables

```bash
# Production Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NODE_ENV=production

# Database URLs (Production Neon PostgreSQL)
AUTH_DATABASE_URL=postgresql://...
HR_DATABASE_URL=postgresql://...
PAYROLL_DATABASE_URL=postgresql://...

# Email Configuration (Production Mailtrap or SendGrid)
MAILTRAP_API_TOKEN=your-production-mailtrap-token
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=hello@yourdomain.com
EMAIL_FROM_NAME=SalarySync

# Authentication (Generate a strong secret)
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum

# Stripe Configuration (Production keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

#### Automatic Environment Detection

The application now includes automatic environment detection for the verification URL:

1. **If `NEXTAUTH_URL` is set**: Uses that value (recommended)
2. **If in production without `NEXTAUTH_URL`**: Uses `https://${VERCEL_URL}`
3. **If in development**: Falls back to `http://localhost:3001`

## Deployment Steps

### 1. Vercel Setup

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build:vercel`
4. Deploy

### 2. Database Setup

Ensure your Neon PostgreSQL databases are:
- Accessible from Vercel's IP ranges
- Have proper connection pooling configured
- Include `?sslmode=require&channel_binding=require` in connection strings

### 3. Email Configuration

For production email delivery:
- Use Mailtrap for testing
- Consider SendGrid, Mailgun, or AWS SES for production
- Update `EMAIL_FROM` to your domain
- Configure SPF/DKIM records for your domain

### 4. Stripe Configuration

- Use live Stripe keys in production
- Configure webhook endpoints in Stripe dashboard
- Point webhooks to: `https://your-app.vercel.app/api/webhooks/stripe`

## Email Verification Fix

### Issue Resolved

The email verification system was failing because:
- Development server runs on port 3001
- `NEXTAUTH_URL` was set to port 3000
- Verification emails contained invalid URLs

### Solution Implemented

1. **Updated `.env` for development**: `NEXTAUTH_URL=http://localhost:3001`
2. **Added environment-aware URL generation**: Automatically detects correct URL
3. **Production fallback**: Uses `VERCEL_URL` if `NEXTAUTH_URL` not set

### Testing

To test email verification:
1. Register a new user
2. Check that verification email contains correct URL
3. Click verification link to confirm it works
4. Verify user is activated in database

## Security Considerations

### Environment Variables

- Never commit real credentials to Git
- Use different secrets for development and production
- Rotate secrets regularly
- Use Vercel's environment variable encryption

### Database Security

- Use connection pooling
- Enable SSL/TLS connections
- Restrict database access to necessary IPs
- Regular security updates

### Email Security

- Configure SPF, DKIM, and DMARC records
- Use secure email providers
- Monitor email delivery rates
- Implement rate limiting for email sending

## Monitoring and Maintenance

### Health Checks

Use the built-in health check endpoint:
```bash
npm run db:health
```

### Logs

Monitor Vercel function logs for:
- Database connection errors
- Email delivery failures
- Authentication issues
- Stripe webhook failures

### Performance

- Monitor cold start times
- Check database query performance
- Monitor email delivery rates
- Track user registration success rates

## Troubleshooting

### Common Issues

1. **Email verification fails**
   - Check `NEXTAUTH_URL` is correct
   - Verify email service configuration
   - Check spam folders

2. **Database connection errors**
   - Verify connection strings
   - Check Neon database status
   - Confirm SSL configuration

3. **Stripe webhook failures**
   - Verify webhook URL in Stripe dashboard
   - Check webhook secret configuration
   - Monitor Vercel function logs

### Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connections
4. Monitor function execution logs

---

**Last Updated:** September 18, 2025  
**Version:** 1.0.0
