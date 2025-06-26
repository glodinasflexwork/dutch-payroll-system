'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface SubscriptionStatus {
  plan: {
    name: string
    maxEmployees?: number
    maxPayrolls?: number
    features: Record<string, boolean>
  }
  usage: {
    employees: number
    payrolls: number
  }
  status: string
  currentPeriodEnd: string
}

export default function SubscriptionStatus() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-sm text-red-800">No active subscription found</span>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'trialing': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'past_due': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'canceled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUsagePercentage = (current: number, max?: number) => {
    if (!max) return 0
    return Math.min((current / max) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CreditCardIcon className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Plan Information */}
        <div>
          <p className="text-sm font-medium text-gray-900">{subscription.plan.name} Plan</p>
          <p className="text-xs text-gray-500">
            Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        {/* Usage Limits */}
        <div className="space-y-3">
          {/* Employee Usage */}
          {subscription.plan.maxEmployees && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <UsersIcon className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">Employees</span>
                </div>
                <span className="text-sm text-gray-900">
                  {subscription.usage.employees} / {subscription.plan.maxEmployees}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.usage.employees, subscription.plan.maxEmployees))}`}
                  style={{ width: `${getUsagePercentage(subscription.usage.employees, subscription.plan.maxEmployees)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Payroll Usage */}
          {subscription.plan.maxPayrolls && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-700">Monthly Payrolls</span>
                </div>
                <span className="text-sm text-gray-900">
                  {subscription.usage.payrolls} / {subscription.plan.maxPayrolls}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.usage.payrolls, subscription.plan.maxPayrolls))}`}
                  style={{ width: `${getUsagePercentage(subscription.usage.payrolls, subscription.plan.maxPayrolls)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Features</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(subscription.plan.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center">
                <CheckCircleIcon className={`w-4 h-4 mr-2 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={`text-xs ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Button */}
        {subscription.status !== 'active' && (
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Upgrade Plan
          </button>
        )}
      </div>
    </div>
  )
}

