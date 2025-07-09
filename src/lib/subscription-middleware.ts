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

    // If no subscription, this should not happen as trial is created on registration
    if (!company.subscription) {
      return {
        isValid: true,
        limits: {
          maxEmployees: 1,
          maxPayrolls: 0,
          maxCompanies: 1,
          features: ['employees'] // Very limited access
        },
        upgradeRequired: true,
        error: 'No subscription found - please contact support'
      }
    }

    const subscription = company.subscription
    const plan = subscription.plan

    // Check if subscription is active or in trial
    const isActive = subscription.status === 'active'
    const isTrialing = subscription.status === 'trialing' || subscription.isTrialActive
    const now = new Date()
    const trialValid = subscription.trialEnd ? now <= subscription.trialEnd : true
    const isExpired = !isActive && (!isTrialing || !trialValid)

    // During active trial, provide FULL ACCESS to all features
    if (isTrialing && trialValid) {
      return {
        isValid: true,
        subscription,
        limits: {
          maxEmployees: 999, // Unlimited during trial
          maxPayrolls: 999, // Unlimited during trial
          maxCompanies: 999, // Unlimited during trial
          features: ['payroll', 'employees', 'leave_management', 'time_tracking', 'advanced_reports', 'multi_company', 'api_access', 'custom_integrations'] // All features
        },
        isTrial: true,
        message: 'Trial active - full access to all features'
      }
    }

    // If subscription is expired, provide very limited access
    if (isExpired) {
      return {
        isValid: true, // Still valid for basic features
        subscription,
        limits: {
          maxEmployees: 999, // Always allow employee management
          maxPayrolls: 0, // No payroll processing when expired
          maxCompanies: 1, // Basic company access
          features: ['employees'] // Only core features
        },
        upgradeRequired: true,
        isExpired: true,
        message: 'Trial expired - upgrade to access premium features'
      }
    }

    // Define plan limits based on Stripe price IDs
    const planLimits: Record<string, SubscriptionLimits> = {
      'price_1ReIAFKopO2jXhaHl9D9oblI': { // STARTER
        maxEmployees: 10,
        maxPayrolls: 12,
        maxCompanies: 1,
        features: ['payroll', 'employees', 'leave_management', 'basic_reports']
      },
      'price_1ReIAFKopO2jXhaHq19ISvSc': { // PROFESSIONAL
        maxEmployees: 50,
        maxPayrolls: 12,
        maxCompanies: 3,
        features: ['payroll', 'employees', 'leave_management', 'time_tracking', 'advanced_reports', 'multi_company']
      },
      'price_1ReIAGKopO2jXhaHJ9CjDvU7': { // ENTERPRISE
        maxEmployees: 999,
        maxPayrolls: 999,
        maxCompanies: 999,
        features: ['payroll', 'employees', 'leave_management', 'time_tracking', 'advanced_reports', 'multi_company', 'api_access', 'custom_integrations']
      }
    }

    const limits = planLimits[plan?.stripePriceId] || planLimits['price_1ReIAFKopO2jXhaHl9D9oblI']

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
        Company: {
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

export async function checkOperationLimits(
  companyId: string,
  operation: 'employee' | 'payroll' | 'company',
  currentCount?: number
): Promise<{ allowed: boolean; error?: string; limit?: number; warning?: string }> {
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
        
        // During trial, allow unlimited employees
        if (validation.isTrial) {
          return { allowed: true, limit, warning: validation.message }
        }
        
        // For expired subscriptions, still allow employee management
        if (validation.isExpired || validation.upgradeRequired) {
          return { 
            allowed: true, 
            limit,
            warning: validation.message || 'Subscription expired - upgrade to access premium features'
          }
        }
        
        if (count >= limit) {
          return {
            allowed: false,
            error: `Employee limit reached. Your plan allows up to ${limit} employees.`,
            limit
          }
        }
        
        return { allowed: true, limit }

      case 'payroll':
        limit = limits.maxPayrolls
        if (count === undefined) {
          count = await prisma.payrollRecord.count({
            where: { companyId }
          })
        }
        
        // During trial, allow unlimited payroll
        if (validation.isTrial) {
          return { allowed: true, limit, warning: validation.message }
        }
        
        // Block payroll for expired subscriptions
        if (validation.isExpired || validation.upgradeRequired) {
          return {
            allowed: false,
            error: validation.message || 'Subscription expired - upgrade to process payroll',
            limit
          }
        }
        
        if (count >= limit) {
          return {
            allowed: false,
            error: `Payroll limit reached. Your plan allows up to ${limit} payrolls.`,
            limit
          }
        }
        
        return { allowed: true, limit }

      case 'company':
        limit = limits.maxCompanies
        // This would be checked at user level, not company level
        return { allowed: true }
        
      default:
        return { allowed: false, error: 'Unknown operation type' }
    }

  } catch (error) {
    console.error('Error checking operation limits:', error)
    return {
      allowed: false,
      error: 'Failed to check limits'
    }
  }
}

