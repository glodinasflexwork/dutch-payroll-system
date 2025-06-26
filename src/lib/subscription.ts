import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export interface SubscriptionLimits {
  maxEmployees?: number
  maxPayrolls?: number
  features: Record<string, boolean>
}

export async function validateSubscription(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    })

    if (!company?.subscription) {
      return { isValid: false, error: 'No active subscription' }
    }

    const subscription = company.subscription
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return { isValid: false, error: 'Subscription inactive' }
    }

    const limits: SubscriptionLimits = {
      maxEmployees: subscription.plan.maxEmployees,
      maxPayrolls: subscription.plan.maxPayrolls,
      features: subscription.plan.features as Record<string, boolean>
    }

    return { isValid: true, subscription, limits }
  } catch (error) {
    return { isValid: false, error: 'Validation failed' }
  }
}

export async function hasFeature(companyId: string, feature: string): Promise<boolean> {
  const validation = await validateSubscription(companyId)
  return validation.isValid && validation.limits?.features[feature] === true
}

