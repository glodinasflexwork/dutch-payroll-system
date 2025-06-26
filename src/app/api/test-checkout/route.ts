import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test checkout API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session data:', {
      userId: session?.user?.id,
      companyId: session?.user?.companyId,
      email: session?.user?.email
    });
    
    if (!session?.user?.id || !session?.user?.companyId) {
      console.log('❌ Unauthorized - missing session data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();
    console.log('Received priceId:', priceId);

    if (!priceId) {
      console.log('❌ Missing priceId');
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Creating simplified checkout session...');

    // Create a very simple checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://dutch-payroll-system.vercel.app/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dutch-payroll-system.vercel.app/subscription?canceled=true`,
      metadata: {
        companyId: session.user.companyId,
        userId: session.user.id,
        test: 'true'
      }
    });

    console.log('✅ Checkout session created:', checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error) {
    console.error('❌ Test checkout error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Test checkout failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

