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

    const { priceId, planId } = await request.json();

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: 'Price ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL is not configured');
      return NextResponse.json(
        { error: 'Application URL not configured' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session directly (simplified version)
    const checkoutSession = await stripe.checkout.sessions.create({
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
        companyId: session.user.companyId,
        planId: planId,
        userId: session.user.id
      },
      subscription_data: {
        metadata: {
          companyId: session.user.companyId,
          planId: planId
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      priceId: request.body ? JSON.parse(await request.text()).priceId : 'unknown',
      planId: request.body ? JSON.parse(await request.text()).planId : 'unknown'
    });
    return NextResponse.json(
      { 
        error: 'Failed to start checkout process. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  } finally {
    await getAuthClient().$disconnect();
  }
}

