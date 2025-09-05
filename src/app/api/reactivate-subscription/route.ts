import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthClient } from "@/lib/database-clients";
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the user's company
    const subscription = await getAuthClient().subscription.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
        companyId: session.user.companyId
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Reactivate the subscription in Stripe
    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    // Update the subscription in our database
    await getAuthClient().subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        status: reactivatedSubscription.status
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription has been reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  } finally {
    await getAuthClient().$disconnect();
  }
}

