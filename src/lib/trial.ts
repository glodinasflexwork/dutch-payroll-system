/**
 * Trial Management Utilities
 * Handles trial creation, validation, and expiration logic
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TRIAL_DURATION_DAYS = 14;

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  daysUsed: number;
  startDate: Date | null;
  endDate: Date | null;
  isExpired: boolean;
  canExtend: boolean;
}

/**
 * Create a new 14-day trial for a company
 */
export async function createTrial(companyId: string): Promise<void> {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + (TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000));

  // Find the Trial Plan (note: it's named "Trial Plan" not "Trial")
  const trialPlan = await prisma.plan.findFirst({
    where: { name: 'Trial Plan' }
  });

  if (!trialPlan) {
    throw new Error('Trial Plan not found in database');
  }

  // Check if subscription already exists for this company
  const existingSubscription = await prisma.subscription.findFirst({
    where: { companyId }
  });

  if (existingSubscription) {
    console.log(`Subscription already exists for company ${companyId}`);
    return;
  }

  // Create subscription with trial
  await prisma.subscription.create({
    data: {
      companyId,
      planId: trialPlan.id,
      status: 'trialing',
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      trialEnd: trialEnd
    }
  });

  console.log(`Trial created successfully for company ${companyId}`);
}

/**
 * Get trial status for a company
 */
export async function getTrialStatus(companyId: string): Promise<TrialStatus | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { companyId },
    include: { Plan: true }
  });

  if (!subscription) {
    return null;
  }

  // If not in trial status, return null
  if (subscription.status !== 'trialing' || !subscription.trialEnd) {
    return null;
  }

  const now = new Date();
  const trialStart = subscription.currentPeriodStart;
  const trialEnd = subscription.trialEnd;
  
  const totalTrialMs = trialEnd.getTime() - trialStart.getTime();
  const usedTrialMs = now.getTime() - trialStart.getTime();
  const remainingTrialMs = trialEnd.getTime() - now.getTime();
  
  const daysUsed = Math.max(0, Math.floor(usedTrialMs / (24 * 60 * 60 * 1000)));
  const daysRemaining = Math.max(0, Math.ceil(remainingTrialMs / (24 * 60 * 60 * 1000)));
  const isExpired = now > trialEnd;

  return {
    isActive: subscription.status === 'trialing' && !isExpired,
    daysRemaining,
    daysUsed,
    startDate: trialStart,
    endDate: trialEnd,
    isExpired,
    canExtend: false // For now, no extensions
  };
}

/**
 * Check if a company has trial access to features
 */
export async function hasTrialAccess(companyId: string): Promise<boolean> {
  const trialStatus = await getTrialStatus(companyId);
  return trialStatus?.isActive ?? false;
}

/**
 * Extend trial by additional days (admin function)
 */
export async function extendTrial(companyId: string, additionalDays: number = 7): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId }
  });

  if (!subscription || !subscription.trialEnd) {
    throw new Error('No active trial found');
  }

  const newTrialEnd = new Date(subscription.trialEnd.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

  await prisma.subscription.update({
    where: { companyId },
    data: {
      trialEnd: newTrialEnd,
      currentPeriodEnd: newTrialEnd,
      trialExtensions: subscription.trialExtensions + 1
    }
  });
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrialToPaid(
  companyId: string, 
  planId: string, 
  stripeSubscriptionId: string
): Promise<void> {
  const now = new Date();
  
  await prisma.subscription.update({
    where: { companyId },
    data: {
      planId,
      status: 'active',
      stripeSubscriptionId,
      isTrialActive: false,
      convertedFromTrial: true,
      trialConvertedAt: now
    }
  });
}

/**
 * Expire trial and update status
 */
export async function expireTrial(companyId: string): Promise<void> {
  await prisma.subscription.update({
    where: { companyId },
    data: {
      status: 'trial_expired',
      isTrialActive: false
    }
  });
}

/**
 * Get companies with expiring trials (for notifications)
 */
export async function getExpiringTrials(daysBeforeExpiry: number = 3): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysBeforeExpiry);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      isTrialActive: true,
      trialEnd: {
        lte: cutoffDate,
        gte: new Date() // Not already expired
      }
    },
    select: {
      companyId: true
    }
  });

  return subscriptions.map(sub => sub.companyId);
}

/**
 * Clean up expired trials (run as cron job)
 */
export async function cleanupExpiredTrials(): Promise<number> {
  const now = new Date();
  
  const result = await prisma.subscription.updateMany({
    where: {
      isTrialActive: true,
      trialEnd: {
        lt: now
      }
    },
    data: {
      status: 'trial_expired',
      isTrialActive: false
    }
  });

  return result.count;
}

