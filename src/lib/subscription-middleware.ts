import { NextRequest, NextResponse } from 'next/server'
import { validateCompanyAccess } from '@/lib/company-context'
import { prisma } from '@/lib/prisma'

export interface SubscriptionLimits {
  maxEmployees: number
  maxPayrolls: number
  maxCompanies: number
  features: string[]
}

export interface SubscriptionValidation {
  isValid: boolean
  subscription?: any
  limits?: SubscriptionLimits
  error?: string
  upgradeRequired?: boolean
}

/**
 * Validate subscription and enforce limits for multi-company operations
 */
export async function validateSubscription(companyId: string): Promise<SubscriptionValidation> {
  try {
    // Get company's subscription
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    if (!company) {
      return {
        isValid: false,
        error: 'Company not found'
      }
    }

    // If no subscription, use trial limits
    if (!company.subscription) {
      return {
        isValid: true,
        limits: {
          maxEmployees: 5,
          maxPayrolls: 3,
          maxCompanies: 1,
          features: ['basic_payroll', 'employees']
        }
      }
    }

    const subscription = company.subscription
    const plan = subscription.plan

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return {
        isValid: false,
        error: 'Subscription is not active',
        upgradeRequired: true
      }
    }

    // Check if subscription has expired
    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      return {
        isValid: false,
        error: 'Subscription has expired',
        upgradeRequired: true
      }
    }

    // Define plan limits based on Stripe price IDs
    const planLimits: Record<string, SubscriptionLimits> = {
      'price_1ReIAFKop02jXhaH19D9oblI': { // STARTER
        maxEmployees: 10,
        maxPayrolls: 12,
        maxCompanies: 1,
        features: ['payroll', 'employees', 'leave_management', 'basic_reports']
      },
      'price_1ReIAFKop02jXhaHq19ISvSc': { // PROFESSIONAL
        maxEmployees: 50,
        maxPayrolls: 12,
        maxCompanies: 3,
        features: ['payroll', 'employees', 'leave_management', 'time_tracking', 'advanced_reports', 'multi_company']
      },
      'price_1ReIAGKop02jXhaHJ9CjDvU7': { // ENTERPRISE
        maxEmployees: 999,
        maxPayrolls: 999,
        maxCompanies: 999,
        features: ['payroll', 'employees', 'leave_management', 'time_tracking', 'advanced_reports', 'multi_company', 'api_access', 'custom_integrations']
      }
    }

    const limits = planLimits[plan.stripePriceId] || planLimits['price_1ReIAFKop02jXhaH19D9oblI']

    return {
      isValid: true,
      subscription,
      limits
    }

  } catch (error) {
    console.error('Error validating subscription:', error)
    return {
      isValid: false,
      error: 'Failed to validate subscription'
    }
  }
}

/**
 * Check if user can create a new company based on their subscription
 */
export async function validateCompanyCreation(userId: string): Promise<SubscriptionValidation> {
  try {
    // Get user's companies and their subscriptions
    const userCompanies = await prisma.userCompany.findMany({
      where: {
        userId,
        role: 'owner' // Only count companies where user is owner
      },
      include: {
        company: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    })

    if (userCompanies.length === 0) {
      // First company - always allowed
      return { isValid: true }
    }

    // Find the highest tier subscription among user's companies
    let highestLimits: SubscriptionLimits = {
      maxEmployees: 5,
      maxPayrolls: 3,
      maxCompanies: 1,
      features: ['basic_payroll']
    }

    for (const userCompany of userCompanies) {
      const validation = await validateSubscription(userCompany.company.id)
      if (validation.limits && validation.limits.maxCompanies > highestLimits.maxCompanies) {
        highestLimits = validation.limits
      }
    }

    // Check if user has reached company limit
    if (userCompanies.length >= highestLimits.maxCompanies) {
      return {
        isValid: false,
        error: `Company limit reached. Your plan allows up to ${highestLimits.maxCompanies} companies.`,
        upgradeRequired: true,
        limits: highestLimits
      }
    }

    return {
      isValid: true,
      limits: highestLimits
    }

  } catch (error) {
    console.error('Error validating company creation:', error)
    return {
      isValid: false,
      error: 'Failed to validate company creation'
    }
  }
}

/**
 * Middleware to check feature access
 */
export async function validateFeatureAccess(
  request: NextRequest,
  requiredFeature: string
): Promise<{ hasAccess: boolean; error?: string; status?: number }> {
  try {
    const { context, error, status } = await validateCompanyAccess(request, ['employee'])
    
    if (!context || error) {
      return { hasAccess: false, error, status }
    }

    const validation = await validateSubscription(context.companyId)
    
    if (!validation.isValid) {
      return {
        hasAccess: false,
        error: validation.error || 'Subscription validation failed',
        status: 403
      }
    }

    if (!validation.limits?.features.includes(requiredFeature)) {
      return {
        hasAccess: false,
        error: `Feature '${requiredFeature}' not available in your plan`,
        status: 403
      }
    }

    return { hasAccess: true }

  } catch (error) {
    console.error('Error validating feature access:', error)
    return {
      hasAccess: false,
      error: 'Failed to validate feature access',
      status: 500
    }
  }
}

/**
 * Check if operation would exceed subscription limits
 */
export async function checkOperationLimits(
  companyId: string,
  operation: 'employee' | 'payroll' | 'company',
  currentCount?: number
): Promise<{ allowed: boolean; error?: string; limit?: number }> {
  try {
    const validation = await validateSubscription(companyId)
    
    if (!validation.isValid || !validation.limits) {
      return {
        allowed: false,
        error: validation.error || 'Invalid subscription'
      }
    }

    const limits = validation.limits
    let limit: number
    let count = currentCount

    switch (operation) {
      case 'employee':
        limit = limits.maxEmployees
        if (count === undefined) {
          count = await prisma.employee.count({
            where: { companyId, isActive: true }
          })
        }
        break
      case 'payroll':
        limit = limits.maxPayrolls
        if (count === undefined) {
          count = await prisma.payroll.count({
            where: { companyId }
          })
        }
        break
      case 'company':
        limit = limits.maxCompanies
        // This would be checked at user level, not company level
        return { allowed: true }
      default:
        return { allowed: false, error: 'Unknown operation type' }
    }

    if (count >= limit) {
      return {
        allowed: false,
        error: `${operation} limit reached. Your plan allows up to ${limit} ${operation}s.`,
        limit
      }
    }

    return { allowed: true, limit }

  } catch (error) {
    console.error('Error checking operation limits:', error)
    return {
      allowed: false,
      error: 'Failed to check limits'
    }
  }
}

