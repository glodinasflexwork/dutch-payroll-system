'use client'

import { useState, useEffect } from 'react'
import { Crown, Check, AlertTriangle, CreditCard, Calendar, Users, FileText } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  stripePriceId: string | null
  maxEmployees: number | null
  maxPayrolls: number | null
  features: string[]
}

interface TrialInfo {
  isActive: boolean
  daysRemaining: number
  daysUsed: number
  startDate: string
  endDate: string
  message: string
}

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: string
  plan: Plan
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch plans
      const plansResponse = await fetch('/api/plans')
      if (!plansResponse.ok) {
        throw new Error('Failed to fetch plans')
      }
      const plansData = await plansResponse.json()
      setPlans(plansData)

      // Fetch current subscription
      const subscriptionResponse = await fetch('/api/subscription')
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setCurrentSubscription(subscriptionData)
      }

      // Fetch trial status
      const trialResponse = await fetch('/api/trial/status')
      if (trialResponse.ok) {
        const trialData = await trialResponse.json()
        setTrialInfo(trialData)
      }

    } catch (err) {
      console.error('Error fetching subscription data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan || !plan.stripePriceId) {
        throw new Error('Invalid plan selected')
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: planId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start checkout process')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      console.error('Error starting checkout:', err)
      alert('Failed to start checkout process. Please try again.')
    }
  }

  const handleStartTrial = () => {
    // For trial, we can redirect to a trial signup or handle it differently
    alert('Trial functionality - this would start a new trial period')
  }

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(0)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Subscription</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubscriptionData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your plan and billing</p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
        
        {trialInfo?.isActive ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Free Trial Active</span>
            </div>
            <p className="text-blue-700 mt-2">
              {trialInfo.daysRemaining} days remaining ({trialInfo.daysUsed} days used)
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Trial ends on {new Date(trialInfo.endDate).toLocaleDateString()}
            </p>
          </div>
        ) : currentSubscription ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">
                {currentSubscription.plan.name} Plan
              </span>
            </div>
            <p className="text-green-700 mt-2">
              {formatPrice(currentSubscription.plan.price)}/month
            </p>
            <p className="text-sm text-green-600 mt-1">
              Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-900">No Active Subscription</span>
            </div>
            <p className="text-yellow-700 mt-2">
              Choose a plan to continue using SalarySync
            </p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Plan</h2>
        <p className="text-gray-600 mb-6">
          Select the perfect plan for your payroll management needs. Upgrade or downgrade at any time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                plan.name === 'Professional' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200'
              }`}
            >
              {plan.name === 'Professional' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(plan.price)}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {plan.maxEmployees ? `Up to ${plan.maxEmployees} employees` : 'Unlimited employees'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {plan.maxPayrolls ? `${plan.maxPayrolls} payrolls per year` : 'Unlimited payrolls'}
                </div>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => plan.price === 0 ? handleStartTrial() : handleUpgrade(plan.id)}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  plan.name === 'Professional'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.price === 0
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                }`}
                disabled={currentSubscription?.plan.id === plan.id}
              >
                {currentSubscription?.plan.id === plan.id
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Start Trial'
                  : 'Get Started'
                }
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Management */}
      {currentSubscription && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Management</h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <FileText className="h-4 w-4 mr-2" />
              View Billing History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

