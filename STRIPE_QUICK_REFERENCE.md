# 🚀 Stripe Setup Quick Reference

## 🔧 Setup Commands

```bash
# 1. Add your Stripe keys to .env
STRIPE_SECRET_KEY="sk_test_or_sk_live_your_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_or_pk_live_your_key"

# 2. Run automated setup
npm run setup-stripe

# 3. Test the integration
node scripts/test-webhooks.js

# 4. Test webhooks locally (requires Stripe CLI)
npm run test-webhooks
```

## 📋 Checklist

### Development Setup
- [ ] Stripe test keys in `.env`
- [ ] Run `npm run setup-stripe`
- [ ] Copy generated price IDs to `.env`
- [ ] Test subscription flow
- [ ] Test webhook delivery

### Production Setup
- [ ] Stripe live keys in deployment environment
- [ ] Create live products/prices
- [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Update price IDs in production environment
- [ ] Test live payments
- [ ] Monitor Stripe Dashboard

## 🔗 Important URLs

- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Test Cards**: https://stripe.com/docs/testing#cards

## 💳 Test Cards

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000002500003155`

## 🎯 Webhook Events

Required events for your endpoint:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.trial_will_end`

## 🆘 Troubleshooting

### Common Issues
1. **"No signature"** → Check webhook secret in `.env`
2. **"Invalid signature"** → Verify webhook endpoint URL
3. **"Product not found"** → Run setup script first
4. **"Authentication failed"** → Check API keys

### Debug Steps
1. Check Stripe Dashboard logs
2. Review webhook delivery attempts
3. Test with Stripe CLI
4. Verify environment variables
5. Check application logs

## 📞 Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Testing Guide**: https://stripe.com/docs/testing

