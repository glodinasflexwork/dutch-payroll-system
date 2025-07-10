import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export interface SubscriptionLimits {
  maxEmployees?: number
  maxPayrolls?: number
  features: Record<string, boolean>
}

// Helper function to convert feature array to boolean object
function convertFeaturesToObject(features: any): Record<string, boolean> {
  if (Array.isArray(features)) {
    // Convert array of feature strings to boolean object
    const featureMap: Record<string, boolean> = {
      employees: false,
      payroll: false,
      leave_management: false,
      time_tracking: false,
      reporting: false,
      multi_company: false
    }
    
    features.forEach((feature: string) => {
      const lowerFeature = feature.toLowerCase()
      if (lowerFeature.includes('employee')) {
        featureMap.employees = true
      }
      if (lowerFeature.includes('payroll')) {
        featureMap.payroll = true
      }
      if (lowerFeature.includes('report') || lowerFeature.includes('analytic')) {
        featureMap.reporting = true
      }
      if (lowerFeature.includes('tax')) {
        featureMap.payroll = true // Tax calculations are part of payroll
      }
      if (lowerFeature.includes('leave') || lowerFeature.includes('time')) {
        featureMap.leave_management = true
        featureMap.time_tracking = true
      }
      if (lowerFeature.includes('support') || lowerFeature.includes('priority')) {
        // Support features don't map to specific functionality
      }
      if (lowerFeature.includes('self-service') || lowerFeature.includes('portal')) {
        featureMap.employees = true // Employee portal is part of employee management
      }
      if (lowerFeature.includes('schedule')) {
        featureMap.payroll = true // Custom schedules are part of payroll
      }
    })
    
    return featureMap
  } else if (typeof features === 'object' && features !== null) {
    // Already in correct format
    return features as Record<string, boolean>
  } else {
    // Fallback to basic features
    return {
      employees: true,
      payroll: false,
      leave_management: false,
      time_tracking: false,
      reporting: false,
      multi_company: false
    }
  }
}

export async function validateSubscription(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        Subscription: {
          include: { Plan: true }
        }
      }
    })

    if (!company?.Subscription) {
      // No subscription found - this should not happen as trial is created on registration
      // Provide very limited access as fallback
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
        message: 'No subscription found - please contact support'
      }
    }

    const subscription = company.Subscription // One-to-one relation, not array
    
    // Check if subscription is active or in trial (with null safety)
    const isActive = subscription.status === 'active'
    const isTrialing = subscription.status === 'trialing' || subscription.isTrialActive
    
    // Check if trial is still valid (within trial period)
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
          features: {
            employees: true,
            payroll: true,
            leave_management: true,
            time_tracking: true,
            reporting: true,
            multi_Company: true // Full access during trial
          }
        },
        isTrial: true,
        isExpired: false,
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
        message: 'Trial expired - upgrade to access premium features'
      }
    }

    // For active paid subscriptions with a plan
    const limits: SubscriptionLimits = {
      maxEmployees: subscription.Plan?.maxEmployees || 999,
      maxPayrolls: subscription.Plan?.maxPayrolls || 999,
      features: convertFeaturesToObject(subscription.Plan?.features) // Convert features properly
    }

    return { 
      isValid: true, 
      subscription, 
      limits, 
      isTrial: false,
      isExpired: false,
      message: 'Active subscription'
    }
  } catch (error) {
    console.error('Subscription validation error:', error)
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

export async function hasFeature(companyId: string, feature: string): Promise<boolean> {
  const validation = await validateSubscription(companyId)
  return validation.isValid && validation.limits?.features[feature] === true
}

