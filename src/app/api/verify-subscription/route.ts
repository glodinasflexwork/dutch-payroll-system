import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items.data.price.product']
    });

    if (!checkoutSession.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const stripeSubscription = checkoutSession.subscription as Stripe.Subscription;
    const companyId = checkoutSession.metadata?.companyId;
    const planId = checkoutSession.metadata?.planId;

    if (companyId !== session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if subscription already exists in our database
    let subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: stripeSubscription.id
      },
      include: {
        plan: true
      }
    });

    if (!subscription) {
      // Create new subscription record
      subscription = await prisma.subscription.create({
        data: {
          companyId: companyId!,
          planId: planId!,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer as string,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        },
        include: {
          plan: true
        }
      });

      // Deactivate any other active subscriptions for this company
      await prisma.subscription.updateMany({
        where: {
          companyId: companyId!,
          id: { not: subscription.id },
          status: 'active'
        },
        data: {
          status: 'canceled'
        }
      });
    }

    return NextResponse.json({
      planName: subscription.plan.name,
      price: subscription.plan.price,
      status: subscription.status
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

