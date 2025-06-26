import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planId } = await request.json();

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: 'Price ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get the plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = company.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: company.name,
        metadata: {
          companyId: company.id,
          userId: session.user.id
        }
      });
      
      customerId = customer.id;
      
      // Update company with Stripe customer ID
      await prisma.company.update({
        where: { id: company.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Determine if this is an upgrade/downgrade or new subscription
    const currentSubscription = company.subscriptions[0];
    const isUpgrade = currentSubscription && currentSubscription.plan.price < plan.price;
    const isDowngrade = currentSubscription && currentSubscription.plan.price > plan.price;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,
      metadata: {
        companyId: company.id,
        planId: planId,
        userId: session.user.id,
        isUpgrade: isUpgrade ? 'true' : 'false',
        isDowngrade: isDowngrade ? 'true' : 'false'
      },
      subscription_data: {
        metadata: {
          companyId: company.id,
          planId: planId
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      priceId,
      planId,
      companyId: session?.user?.companyId
    });
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

