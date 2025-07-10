import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { authClient } from "@/lib/database-clients"
import Stripe from "stripe"

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
      console.error("No Stripe signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// Handle subscription creation/updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const companyId = subscription.metadata.companyId
    if (!companyId) {
      console.error("No companyId in subscription metadata")
      return
    }

    // Get plan information
    const priceId = subscription.items.data[0]?.price.id
    const plan = await authClient.plan.findFirst({
      where: { stripePriceId: priceId }
    })

    if (!plan) {
      console.error(`Plan not found for price ID: ${priceId}`)
      return
    }

    // Update subscription in database
    await authClient.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        planId: plan.id,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      },
      update: {
        planId: plan.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
      }
    })

    console.log(`Subscription updated for company: ${companyId}`)
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const companyId = subscription.metadata.companyId
    if (!companyId) {
      console.error("No companyId in subscription metadata")
      return
    }

    // Update subscription status to canceled
    await authClient.subscription.update({
      where: { companyId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: false
      }
    })

    console.log(`Subscription canceled for company: ${companyId}`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    if (!subscriptionId) return

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const companyId = subscription.metadata.companyId

    if (!companyId) {
      console.error("No companyId in subscription metadata")
      return
    }

    // Update subscription status to active
    await authClient.subscription.update({
      where: { companyId },
      data: {
        status: 'active',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    })

    // TODO: Send payment confirmation email
    console.log(`Payment succeeded for company: ${companyId}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    if (!subscriptionId) return

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const companyId = subscription.metadata.companyId

    if (!companyId) {
      console.error("No companyId in subscription metadata")
      return
    }

    // Update subscription status to past_due
    await authClient.subscription.update({
      where: { companyId },
      data: {
        status: 'past_due'
      }
    })

    // TODO: Send payment failed notification email
    console.log(`Payment failed for company: ${companyId}`)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const companyId = subscription.metadata.companyId
    if (!companyId) {
      console.error("No companyId in subscription metadata")
      return
    }

    // TODO: Send trial ending notification email
    console.log(`Trial ending soon for company: ${companyId}`)
  } catch (error) {
    console.error("Error handling trial will end:", error)
  }
}

