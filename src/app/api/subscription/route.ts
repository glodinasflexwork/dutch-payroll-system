import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { authClient } from "@/lib/database-clients";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const userCompany = await authClient.userCompany.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        Company: {
          include: {
            Subscription: {
              include: {
                Plan: true
              }
            }
          }
        }
      }
    });

    if (!userCompany?.Company?.Subscription) {
      return NextResponse.json({ 
        subscription: null,
        message: 'No active subscription found'
      });
    }

    const subscription = userCompany.Company.Subscription;

    // Format the subscription data
    const formattedSubscription = {
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      trialEnd: subscription.trialEnd,
      trialStart: subscription.trialStart,
      isTrialActive: subscription.isTrialActive,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      plan: {
        id: subscription.Plan.id,
        name: subscription.Plan.name,
        price: subscription.Plan.price,
        currency: subscription.Plan.currency,
        maxEmployees: subscription.Plan.maxEmployees,
        maxPayrolls: subscription.Plan.maxPayrolls,
        features: subscription.Plan.features
      }
    };

    return NextResponse.json({ 
      subscription: formattedSubscription 
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await authClient.$disconnect();
  }
}

