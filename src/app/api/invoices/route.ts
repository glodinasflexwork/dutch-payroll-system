import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthClient } from "@/lib/database-clients";
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company with Stripe customer ID
    const company = await getAuthClient().company.findUnique({
      where: { id: session.user.companyId }
    });

    if (!company?.stripeCustomerId) {
      return NextResponse.json([]);
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: company.stripeCustomerId,
      limit: 20,
      expand: ['data.subscription']
    });

    // Format invoices for frontend
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      description: invoice.description,
      number: invoice.number
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  } finally {
    await getAuthClient().$disconnect();
  }
}

