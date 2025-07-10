import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient } from "@/lib/database-clients"
import { stripe } from "@/lib/stripe"

// POST /api/billing/portal - Create Stripe customer portal session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current subscription
    const subscription = await authClient.subscription.findUnique({
      where: { companyId: session.user.companyId }
    })

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json({ 
        error: "No subscription found" 
      }, { status: 404 })
    }

    // Get return URL from request or use default
    const { returnUrl } = await request.json().catch(() => ({}))
    const defaultReturnUrl = `${process.env.NEXTAUTH_URL}/dashboard/billing`

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl || defaultReturnUrl,
    })

    return NextResponse.json({
      success: true,
      url: portalSession.url
    })

  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/billing/invoices - Get customer invoices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current subscription
    const subscription = await authClient.subscription.findUnique({
      where: { companyId: session.user.companyId }
    })

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json({ 
        error: "No subscription found" 
      }, { status: 404 })
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 10,
      expand: ['data.payment_intent']
    })

    // Format invoices for frontend
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      created: new Date(invoice.created * 1000),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description || `${invoice.lines.data[0]?.description || 'Subscription'}`
    }))

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices
    })

  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

