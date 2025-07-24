import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authClient } from '@/lib/database-clients'

export interface SubscriptionLimits {
  maxEmployees?: number
  maxPayrolls?: number
  features: Record<string, boolean>
}

// Standardized feature definitions for consistent mapping
const FEATURE_DEFINITIONS = {
  employees: ['employee', 'staff', 'personnel', 'hr', 'workforce'],
  payroll: ['payroll', 'salary', 'wage', 'tax', 'compensation'],
  leave_management: ['leave', 'vacation', 'time_off', 'absence', 'holiday'],
  time_tracking: ['time', 'hours', 'timesheet', 'attendance', 'clock'],
  reporting: ['report', 'analytics', 'dashboard', 'insights', 'statistics'],
  multi_company: ['multi', 'multiple', 'companies', 'organizations', 'entities']
}

/**
 * Unified trial status checking - single source of truth
 */
function isTrialActive(subscription: any): boolean {
  if (!subscription) return false
  
  const now = new Date()
  const statusTrialing = subscription.status === 'trialing'
  const flagActive = subscription.isTrialActive === true
  const withinPeriod = subscription.trialEnd ? now <= subscription.trialEnd : false
  
  // Trial is active only if ALL conditions are met
  const isActive = statusTrialing && flagActive && withinPeriod
  
  console.log(`🔍 Trial status check:`, {
    statusTrialing,
    flagActive,
    withinPeriod,
    trialEnd: subscription.trialEnd,
    isActive
  })
  
  return isActive
}

/**
 * Unified subscription status checking
 */
function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false
  
  const now = new Date()
  const statusActive = subscription.status === 'active'
  const notCanceled = !subscription.cancelAtPeriodEnd || now <= subscription.currentPeriodEnd
  
  const isActive = statusActive && notCanceled
  
  console.log(`🔍 Subscription status check:`, {
    statusActive,
    notCanceled,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodEnd: subscription.currentPeriodEnd,
    isActive
  })
  
  return isActive
}

/**
 * Standardized feature mapping with comprehensive keyword matching
 */
function mapFeaturesToObject(features: any): Record<string, boolean> {
  // Initialize all features as false
  const featureMap = Object.keys(FEATURE_DEFINITIONS).reduce((map, key) => {
    map[key] = false
    return map
  }, {} as Record<string, boolean>)

  if (Array.isArray(features)) {
    console.log(`🔍 Mapping features from array:`, features)
    
    features.forEach((feature: string) => {
      const lowerFeature = feature.toLowerCase()
      
      // Check each feature definition for keyword matches
      Object.entries(FEATURE_DEFINITIONS).forEach(([featureKey, keywords]) => {
        if (keywords.some(keyword => lowerFeature.includes(keyword))) {
          featureMap[featureKey] = true
          console.log(`✅ Mapped "${feature}" to ${featureKey}`)
        }
      })
      
      // Special case: "all features" or similar
      if (lowerFeature.includes('all') || lowerFeature.includes('full') || lowerFeature.includes('complete')) {
        Object.keys(featureMap).forEach(key => {
          featureMap[key] = true
        })
        console.log(`✅ Mapped "${feature}" to all features`)
      }
    })
  } else if (typeof features === 'object' && features !== null) {
    console.log(`🔍 Features already in object format:`, features)
    // Already in correct format, but validate keys
    Object.keys(FEATURE_DEFINITIONS).forEach(key => {
      featureMap[key] = Boolean(features[key])
    })
  } else {
    console.log(`⚠️ Unknown features format, using basic fallback:`, features)
    // Fallback to basic employee management only
    featureMap.employees = true
  }

  console.log(`📋 Final feature mapping:`, featureMap)
  return featureMap
}

export async function validateSubscription(companyId: string) {
  try {
    console.log(`🔍 Validating subscription for company: ${companyId}`)
    
    const company = await authClient.company.findUnique({
      where: { id: companyId },
      include: {
        Subscription: {
          include: { Plan: true }
        }
      }
    })

    if (!company?.Subscription) {
      console.log(`⚠️ No subscription found for company: ${companyId}`)
      
      // Attempt automatic trial recovery
      try {
        await ensureTrialSubscription(companyId)
        console.log(`✅ Trial subscription created for company: ${companyId}`)
        
        // Re-fetch the company with the new subscription
        const updatedCompany = await authClient.company.findUnique({
          where: { id: companyId },
          include: {
            Subscription: {
              include: { Plan: true }
            }
          }
        })
        
        if (updatedCompany?.Subscription) {
          // Continue with validation using the new subscription
          return validateSubscriptionData(updatedCompany.Subscription)
        }
      } catch (recoveryError) {
        console.error(`❌ Failed to create trial subscription for company ${companyId}:`, recoveryError)
      }
      
      // Fallback to very limited access
      return { 
        isValid: true, 
        subscription: null,
        limits: {
          maxEmployees: 1, // Very limited
          maxPayrolls: 0, // No payroll without subscription
          features: {
            employees: true, // Basic employee management only
            payroll: false,
            leave_management: false,
            time_tracking: false,
            reporting: false,
            multi_company: false
          }
        },
        isTrial: false,
        isExpired: true,
        message: 'No subscription found - limited access granted'
      }
    }

    return validateSubscriptionData(company.Subscription)

  } catch (error) {
    console.error('❌ Subscription validation error:', error)
    // On error, provide very limited access to prevent blocking users completely
    return { 
      isValid: true, 
      subscription: null,
      limits: {
        maxEmployees: 1, // Very limited on error
        maxPayrolls: 0, // No payroll on error
        features: {
          employees: true, // Core feature always available
          payroll: false,
          leave_management: false,
          time_tracking: false,
          reporting: false,
          multi_company: false
        }
      },
      isTrial: false,
      isExpired: false,
      error: 'Validation error - using safe fallback limits'
    }
  }
}

/**
 * Validate subscription data using unified status checking
 */
function validateSubscriptionData(subscription: any) {
  const trialActive = isTrialActive(subscription)
  const subscriptionActive = isSubscriptionActive(subscription)
  const isExpired = !trialActive && !subscriptionActive

  console.log(`📊 Subscription validation results:`, {
    trialActive,
    subscriptionActive,
    isExpired,
    status: subscription.status
  })

  // During active trial, provide FULL ACCESS to all features
  if (trialActive) {
    return { 
      isValid: true, 
      subscription,
      limits: {
        maxEmployees: 999, // Unlimited during trial
        maxPayrolls: 999, // Unlimited during trial
        features: {
          employees: true,
          payroll: true,
          leave_management: true,
          time_tracking: true,
          reporting: true,
          multi_company: true // Full access during trial
        }
      },
      isTrial: true,
      isExpired: false,
      message: 'Trial active - full access to all features'
    }
  }

  // If subscription is expired, provide limited access
  if (isExpired) {
    return { 
      isValid: true, // Still valid for basic features
      subscription,
      limits: {
        maxEmployees: 999, // Always allow employee management
        maxPayrolls: 0, // No payroll processing when expired
        features: {
          employees: true, // Always allow employee management
          payroll: false, // Restrict payroll when expired
          leave_management: false, // Restrict premium features
          time_tracking: false, // Restrict premium features
          reporting: false, // Restrict premium features
          multi_company: false // Restrict premium features
        }
      },
      isTrial: false,
      isExpired: true,
      message: 'Subscription expired - upgrade to access premium features'
    }
  }

  // For active paid subscriptions with a plan
  const limits: SubscriptionLimits = {
    maxEmployees: subscription.Plan?.maxEmployees || 999,
    maxPayrolls: subscription.Plan?.maxPayrolls || 999,
    features: mapFeaturesToObject(subscription.Plan?.features) // Use new mapping function
  }

  return { 
    isValid: true, 
    subscription, 
    limits, 
    isTrial: false,
    isExpired: false,
    message: 'Active subscription'
  }
}

/**
 * Ensure a company has a trial subscription - create one if missing
 */
async function ensureTrialSubscription(companyId: string) {
  console.log(`🔧 Ensuring trial subscription for company: ${companyId}`)
  
  // Find the canonical trial plan
  const trialPlan = await authClient.plan.findFirst({
    where: { 
      name: "Free Trial",
      isActive: true 
    }
  })

  if (!trialPlan) {
    throw new Error('No active trial plan found')
  }

  const now = new Date()
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now

  await authClient.subscription.create({
    data: {
      companyId: companyId,
      planId: trialPlan.id,
      status: "trialing",
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
      trialEnd: trialEnd,
      isTrialActive: true,
      trialStart: now,
      trialExtensions: 0
    }
  })

  console.log(`✅ Trial subscription created for company: ${companyId}`)
}

export async function hasFeature(companyId: string, feature: string): Promise<boolean> {
  const validation = await validateSubscription(companyId)
  return validation.isValid && validation.limits?.features[feature] === true
}

