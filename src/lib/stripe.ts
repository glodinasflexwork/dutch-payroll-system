import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Stripe configuration
export const STRIPE_CONFIG = {
  // Test mode configuration
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // Webhook configuration
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Currency settings
  currency: 'eur', // Euro for Dutch market
  
  // Plan configurations matching our database
  plans: {
    starter: {
      priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
      name: 'Starter',
      amount: 2900, // €29.00 in cents
      maxEmployees: 5,
      maxPayrolls: 12,
      features: {
        employee_management: true,
        basic_payroll: true,
        basic_reports: true,
        email_support: true,
        payroll_management: false,
        advanced_reports: false,
        api_access: false,
        priority_support: false,
        custom_integrations: false
      }
    },
    professional: {
      priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
      name: 'Professional',
      amount: 7900, // €79.00 in cents
      maxEmployees: 50,
      maxPayrolls: 50,
      features: {
        employee_management: true,
        basic_payroll: true,
        basic_reports: true,
        email_support: true,
        payroll_management: true,
        advanced_reports: true,
        api_access: true,
        priority_support: false,
        custom_integrations: false
      }
    },
    enterprise: {
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
      name: 'Enterprise',
      amount: 19900, // €199.00 in cents
      maxEmployees: null, // Unlimited
      maxPayrolls: null, // Unlimited
      features: {
        employee_management: true,
        basic_payroll: true,
        basic_reports: true,
        email_support: true,
        payroll_management: true,
        advanced_reports: true,
        api_access: true,
        priority_support: true,
        custom_integrations: true
      }
    }
  }
}

// Helper function to get plan configuration by name
export function getPlanConfig(planName: string) {
  const plan = STRIPE_CONFIG.plans[planName.toLowerCase() as keyof typeof STRIPE_CONFIG.plans]
  if (!plan) {
    throw new Error(`Plan ${planName} not found`)
  }
  return plan
}

// Helper function to format amount for display
export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper function to create customer in Stripe
export async function createStripeCustomer(
  email: string,
  name: string,
  companyName: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    description: `Customer for ${companyName}`,
    metadata: {
      companyName,
      ...metadata
    }
  })
}

// Helper function to create subscription
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata
  })
}

