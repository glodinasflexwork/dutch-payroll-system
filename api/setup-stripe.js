/**
 * Vercel Serverless Function for Stripe Setup
 * 
 * This function can be called after deployment to set up Stripe products.
 * URL: https://your-domain.vercel.app/api/setup-stripe
 * 
 * Security: This should be protected or removed after initial setup
 */

const { createStripeProducts } = require('../scripts/vercel-stripe-setup')

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple security check - you can enhance this
  const { authorization } = req.headers
  if (authorization !== `Bearer ${process.env.SETUP_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🚀 Starting Stripe setup via Vercel function...')
    
    const results = await createStripeProducts()
    
    res.status(200).json({
      success: true,
      message: 'Stripe products created successfully',
      results,
      nextSteps: [
        'Add the price ID environment variables to Vercel',
        'Set up webhook endpoint in Stripe Dashboard',
        'Test the subscription flow'
      ]
    })
    
  } catch (error) {
    console.error('Setup failed:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: error.type || 'unknown'
    })
  }
}

