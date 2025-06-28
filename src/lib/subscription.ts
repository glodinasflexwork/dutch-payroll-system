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
      // No subscription found - provide basic access with core features
      return { 
        isValid: true, 
        subscription: null,
        limits: {
          maxEmployees: 10, // Basic limit
          maxPayrolls: 5, // Limited payroll processing
          features: {
            employees: true, // Always allow employee management
            payroll: true, // Limited payroll during trial
            leave_management: true, // Basic leave management
            time_tracking: false, // Premium feature
            reporting: false, // Premium feature
            multi_company: false // Premium feature
          }
        },
        isTrial: true,
        isExpired: false
      }
    }

    const subscription = company.subscription
    
    // Check if subscription is active or in trial
    const isActive = subscription.status === 'active'
    const isTrialing = subscription.status === 'trialing' || subscription.isTrialActive
    
    // Check if trial is still valid (within trial period)
    const now = new Date()
    const trialValid = subscription.trialEnd ? now <= subscription.trialEnd : true
    const isExpired = !isActive && (!isTrialing || !trialValid)

    // If subscription is expired, provide basic access with core features only
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
            leave_management: true, // Basic leave management still allowed
            time_tracking: false, // Premium feature restricted
            reporting: false, // Premium feature restricted
            multi_company: false // Premium feature restricted
          }
        },
        isTrial: false,
        isExpired: true,
        message: 'Subscription expired - upgrade to access premium features'
      }
    }

    // During active trial, provide generous limits
    if (isTrialing && trialValid) {
      return { 
        isValid: true, 
        subscription,
        limits: {
          maxEmployees: 50, // Generous trial limit
          maxPayrolls: 100, // Full payroll access during trial
          features: {
            employees: true,
            payroll: true,
            leave_management: true,
            time_tracking: true,
            reporting: true,
            multi_company: false // Only for paid accounts
          }
        },
        isTrial: true,
        isExpired: false
      }
    }

    // For active paid subscriptions with a plan
    const limits: SubscriptionLimits = {
      maxEmployees: subscription.plan?.maxEmployees || 999,
      maxPayrolls: subscription.plan?.maxPayrolls || 999,
      features: subscription.plan?.features as Record<string, boolean> || {
        employees: true,
        payroll: true,
        leave_management: true,
        time_tracking: true,
        reporting: true,
        multi_company: true
      }
    }

    return { 
      isValid: true, 
      subscription, 
      limits, 
      isTrial: false,
      isExpired: false
    }
  } catch (error) {
    console.error('Subscription validation error:', error)
    // On error, provide basic access to prevent blocking users completely
    return { 
      isValid: true, 
      subscription: null,
      limits: {
        maxEmployees: 999, // Always allow employee management
        maxPayrolls: 0, // No payroll on error
        features: {
          employees: true, // Core feature always available
          payroll: false,
          leave_management: true, // Basic feature
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

export async function hasFeature(companyId: string, feature: string): Promise<boolean> {
  const validation = await validateSubscription(companyId)
  return validation.isValid && validation.limits?.features[feature] === true
}

