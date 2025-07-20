import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { authClient } from '@/lib/database-clients';
import { getTrialStatus } from '@/lib/trial';
import { validateSubscription } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get companyId from session token or user record
    let companyId = session.user.companyId;
    
    if (!companyId) {
      // Fallback: get companyId from user record if not in session
      const user = await authClient.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
      });
      companyId = user?.companyId;
    }

    if (!companyId) {
      return NextResponse.json({ error: 'No company associated with user' }, { status: 400 });
    }

    // Get subscription validation (includes trial status)
    const subscriptionValidation = await validateSubscription(companyId);
    
    // Get detailed trial status from trial service
    const trialStatus = await getTrialStatus(companyId);

    // Determine the response based on subscription validation
    if (subscriptionValidation.isTrial && !subscriptionValidation.isExpired) {
      // Active trial
      return NextResponse.json({
        trial: {
          isActive: true,
          daysRemaining: trialStatus?.daysRemaining || 0,
          daysUsed: trialStatus?.daysUsed || 0,
          startDate: trialStatus?.startDate?.toISOString() || null,
          endDate: trialStatus?.endDate?.toISOString() || null,
          isExpired: false,
          canExtend: trialStatus?.canExtend || false
        },
        hasSubscription: false,
        subscription: null,
        message: subscriptionValidation.message || 'Trial active - full access to all features'
      });
    } else if (subscriptionValidation.isExpired) {
      // Expired trial
      return NextResponse.json({
        trial: {
          isActive: false,
          daysRemaining: 0,
          daysUsed: trialStatus?.daysUsed || 14,
          startDate: trialStatus?.startDate?.toISOString() || null,
          endDate: trialStatus?.endDate?.toISOString() || null,
          isExpired: true,
          canExtend: trialStatus?.canExtend || false
        },
        hasSubscription: false,
        subscription: null,
        message: subscriptionValidation.message || 'Trial expired - upgrade to access premium features'
      });
    } else {
      // Active paid subscription
      return NextResponse.json({
        trial: {
          isActive: false,
          daysRemaining: 0,
          daysUsed: trialStatus?.daysUsed || 0,
          startDate: trialStatus?.startDate?.toISOString() || null,
          endDate: trialStatus?.endDate?.toISOString() || null,
          isExpired: false,
          canExtend: false
        },
        hasSubscription: true,
        subscription: subscriptionValidation.subscription,
        message: subscriptionValidation.message || 'Active subscription'
      });
    }

  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

