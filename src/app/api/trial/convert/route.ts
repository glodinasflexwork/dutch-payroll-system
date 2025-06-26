import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { convertTrialToPaid } from '@/lib/trial';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, stripeSubscriptionId } = await request.json();

    if (!planId || !stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Plan ID and Stripe subscription ID are required' },
        { status: 400 }
      );
    }

    await convertTrialToPaid(
      session.user.companyId,
      planId,
      stripeSubscriptionId
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Trial successfully converted to paid subscription'
    });
  } catch (error) {
    console.error('Error converting trial:', error);
    return NextResponse.json(
      { 
        error: 'Failed to convert trial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

