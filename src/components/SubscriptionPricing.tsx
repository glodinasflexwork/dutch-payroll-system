'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Plan {
  id: string
  name: string
  price: number
  formattedPrice: string
  currency: string
  maxEmployees?: number
  maxPayrolls?: number
  features: Record<string, boolean>
  isCurrentPlan: boolean
  stripePriceId: string
  popular: boolean
}

interface CurrentSubscription {
  id: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
  }
}

export default function SubscriptionPricing() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
        setCurrentSubscription(data.currentSubscription)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!session?.user?.companyId) {
      alert('Please ensure you have a company set up before subscribing.')
      return
    }

    setSubscribing(planId)
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId,
          trialDays: currentSubscription ? 0 : 14 // 14-day trial for new subscriptions
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.clientSecret) {
          // Handle payment confirmation with Stripe
          const stripe = await stripePromise
          if (stripe) {
            const { error } = await stripe.confirmPayment({
              clientSecret: data.clientSecret,
              confirmParams: {
                return_url: `${window.location.origin}/dashboard/billing?success=true`,
              },
            })

            if (error) {
              console.error('Payment confirmation error:', error)
              alert('Payment failed. Please try again.')
            }
          }
        } else {
          // Subscription created successfully (trial or existing customer)
          alert(data.message)
          fetchPlans() // Refresh plans
        }
      } else {
        alert(data.error || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription')
    } finally {
      setSubscribing(null)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setSubscribing(planId)
    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        fetchPlans() // Refresh plans
      } else {
        alert(data.error || 'Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Failed to upgrade subscription')
    } finally {
      setSubscribing(null)
    }
  }

  const openBillingPortal = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Select the perfect plan for your payroll needs
        </p>
      </div>

      {currentSubscription && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Current Plan: {currentSubscription.plan.name}
              </p>
              <p className="text-sm text-blue-700">
                Status: {currentSubscription.status} • 
                {currentSubscription.cancelAtPeriodEnd 
                  ? ` Cancels on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                  : ` Renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                }
              </p>
            </div>
            <button
              onClick={openBillingPortal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Manage Billing
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border ${
              plan.popular 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200'
            } bg-white p-8`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.formattedPrice}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <div className="mt-6">
              <ul className="space-y-3">
                {plan.maxEmployees && (
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">
                      Up to {plan.maxEmployees} employees
                    </span>
                  </li>
                )}
                {plan.maxPayrolls && (
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">
                      {plan.maxPayrolls} payrolls per month
                    </span>
                  </li>
                )}
                {Object.entries(plan.features).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center">
                    {enabled ? (
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-gray-300 mr-3" />
                    )}
                    <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              {plan.isCurrentPlan ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : currentSubscription ? (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={subscribing === plan.id}
                  className={`w-full py-3 px-4 rounded-md text-sm font-medium ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {subscribing === plan.id ? 'Processing...' : 'Upgrade'}
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className={`w-full py-3 px-4 rounded-md text-sm font-medium ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {subscribing === plan.id ? 'Processing...' : 'Start Free Trial'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!currentSubscription && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      )}
    </div>
  )
}

