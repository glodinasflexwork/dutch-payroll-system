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

    // Smart company resolution for multi-company scenarios
    let companyId = session.user.companyId;
    let resolvedCompany = null;
    
    console.log(`[TRIAL API] Starting company resolution for user ${session.user.id}`);
    console.log(`[TRIAL API] Session companyId: ${companyId}`);
    
    // Step 1: Check if session companyId exists and has active trial
    if (companyId) {
      try {
        resolvedCompany = await authClient.company.findUnique({
          where: { id: companyId },
          include: {
            Subscription: true,
            UserCompany: {
              where: { userId: session.user.id },
              select: { role: true }
            }
          }
        });
        
        if (resolvedCompany && resolvedCompany.Subscription?.isTrialActive) {
          console.log(`[TRIAL API] Session company found with active trial: ${resolvedCompany.name}`);
        } else if (resolvedCompany) {
          console.log(`[TRIAL API] Session company found but no active trial: ${resolvedCompany.name}`);
          resolvedCompany = null; // Reset to trigger fallback
        } else {
          console.log(`[TRIAL API] Session company not found: ${companyId}`);
        }
      } catch (error) {
        console.log(`[TRIAL API] Error checking session company: ${error.message}`);
        resolvedCompany = null;
      }
    }
    
    // Step 2: Fallback to user's primary companyId if session company invalid
    if (!resolvedCompany) {
      console.log(`[TRIAL API] Falling back to user's primary company`);
      const user = await authClient.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
      });
      
      if (user?.companyId && user.companyId !== companyId) {
        try {
          resolvedCompany = await authClient.company.findUnique({
            where: { id: user.companyId },
            include: {
              Subscription: true,
              UserCompany: {
                where: { userId: session.user.id },
                select: { role: true }
              }
            }
          });
          
          if (resolvedCompany?.Subscription?.isTrialActive) {
            console.log(`[TRIAL API] User's primary company has active trial: ${resolvedCompany.name}`);
            companyId = user.companyId;
          } else {
            resolvedCompany = null;
          }
        } catch (error) {
          console.log(`[TRIAL API] Error checking user's primary company: ${error.message}`);
        }
      }
    }
    
    // Step 3: Final fallback - find ANY company user has access to with active trial
    if (!resolvedCompany) {
      console.log(`[TRIAL API] Final fallback - searching all user companies for active trial`);
      const userCompanies = await authClient.userCompany.findMany({
        where: { userId: session.user.id },
        include: {
          Company: {
            include: {
              Subscription: true
            }
          }
        }
      });
      
      // Find first company with active trial
      const companyWithTrial = userCompanies.find(uc => 
        uc.Company.Subscription?.isTrialActive
      );
      
      if (companyWithTrial) {
        resolvedCompany = companyWithTrial.Company;
        companyId = resolvedCompany.id;
        console.log(`[TRIAL API] Found company with active trial: ${resolvedCompany.name} (${companyId})`);
      }
    }

    if (!companyId || !resolvedCompany) {
      console.log(`[TRIAL API] No company with active trial found for user`);
      return NextResponse.json({ 
        trial: {
          isActive: false,
          daysRemaining: 0,
          daysUsed: 0,
          startDate: null,
          endDate: null,
          isExpired: true,
          canExtend: false
        },
        hasSubscription: false,
        subscription: null,
        message: 'No subscription found - limited access granted'
      });
    }
    
    console.log(`[TRIAL API] Using company: ${resolvedCompany.name} (${companyId})`);
    console.log(`[TRIAL API] Trial active: ${resolvedCompany.Subscription?.isTrialActive}`);
    console.log(`[TRIAL API] Trial period: ${resolvedCompany.Subscription?.trialStart} to ${resolvedCompany.Subscription?.trialEnd}`);

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
        resolvedCompany: {
          id: companyId,
          name: resolvedCompany.name
        },
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
        resolvedCompany: {
          id: companyId,
          name: resolvedCompany.name
        },
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
        resolvedCompany: {
          id: companyId,
          name: resolvedCompany.name
        },
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

