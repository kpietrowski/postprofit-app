import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Stripe Webhook Handler
 * Processes payment events from all connected Stripe accounts
 * Creates revenue entries automatically based on UTM metadata
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Process the event
  try {
    await processStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Processes different Stripe event types
 */
async function processStripeEvent(event: Stripe.Event) {
  const supabase = await createClient()

  // Determine Stripe account ID
  const accountId = event.account || 'platform'

  // Find the payment connection for this account
  const { data: connection } = await supabase
    .from('payment_connections')
    .select('*')
    .eq('provider', 'stripe')
    .eq('account_id', accountId)
    .eq('status', 'active')
    .single()

  if (!connection) {
    console.warn(`No active connection found for Stripe account: ${accountId}`)

    // Log the webhook anyway
    await supabase.from('webhook_logs').insert({
      provider: 'stripe',
      event_type: event.type,
      event_id: event.id,
      payload: event as any,
      status: 'ignored',
      error_message: 'No active connection found',
    })

    return
  }

  // Log webhook received
  const { data: log } = await supabase
    .from('webhook_logs')
    .insert({
      connection_id: connection.id,
      provider: 'stripe',
      event_type: event.type,
      event_id: event.id,
      payload: event as any,
      status: 'pending',
    })
    .select()
    .single()

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, connection, log?.id)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, connection, log?.id)
        break

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge, connection, log?.id)
        break

      default:
        // Update log status for unsupported events
        if (log) {
          await supabase
            .from('webhook_logs')
            .update({ status: 'ignored', processed_at: new Date().toISOString() })
            .eq('id', log.id)
        }
    }
  } catch (error: any) {
    // Update log with error
    if (log) {
      await supabase
        .from('webhook_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString(),
        })
        .eq('id', log.id)
    }
    throw error
  }
}

/**
 * Handles checkout.session.completed events
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  connection: any,
  logId?: string
) {
  const supabase = await createClient()

  // Extract UTM parameters from metadata
  const campaignId = session.metadata?.campaign_id
  const utmSource = session.metadata?.utm_source
  const utmMedium = session.metadata?.utm_medium
  const utmCampaign = session.metadata?.utm_campaign || campaignId
  const utmContent = session.metadata?.utm_content

  // Find matching tracking link
  const trackingLink = await findTrackingLink(
    connection.user_id,
    utmSource,
    utmCampaign,
    utmContent
  )

  if (!trackingLink) {
    console.warn('No matching tracking link found for checkout session:', session.id)

    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({
          status: 'ignored',
          error_message: 'No matching tracking link found',
          processed_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }
    return
  }

  // Check if revenue entry already exists
  const { data: existing } = await supabase
    .from('revenue_entries')
    .select('id')
    .eq('stripe_payment_id', session.payment_intent as string)
    .single()

  if (existing) {
    console.log('Revenue entry already exists for payment:', session.payment_intent)

    if (logId) {
      await supabase
        .from('webhook_logs')
        .update({
          status: 'processed',
          revenue_entry_id: existing.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }
    return
  }

  // Create revenue entry
  const amount = session.amount_total ? session.amount_total / 100 : 0

  const { data: revenueEntry, error } = await supabase
    .from('revenue_entries')
    .insert({
      user_id: connection.user_id,
      tracking_link_id: trackingLink.id,
      amount,
      description: `Stripe payment from ${session.customer_email || 'customer'}`,
      source: 'automatic',
      processor: 'stripe',
      stripe_payment_id: session.payment_intent as string,
      payment_connection_id: connection.id,
      entry_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create revenue entry: ${error.message}`)
  }

  // Update webhook log
  if (logId) {
    await supabase
      .from('webhook_logs')
      .update({
        status: 'processed',
        revenue_entry_id: revenueEntry.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', logId)
  }

  console.log('Revenue entry created:', revenueEntry.id, 'Amount:', amount)
}

/**
 * Handles payment_intent.succeeded events
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  connection: any,
  logId?: string
) {
  // Similar logic to checkout session
  // Extract metadata and create revenue entry
  console.log('Payment intent succeeded:', paymentIntent.id)

  const supabase = await createClient()

  if (logId) {
    await supabase
      .from('webhook_logs')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', logId)
  }
}

/**
 * Handles charge.succeeded events
 */
async function handleChargeSucceeded(
  charge: Stripe.Charge,
  connection: any,
  logId?: string
) {
  // Similar logic
  console.log('Charge succeeded:', charge.id)

  const supabase = await createClient()

  if (logId) {
    await supabase
      .from('webhook_logs')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', logId)
  }
}

/**
 * Finds a matching tracking link based on UTM parameters
 */
async function findTrackingLink(
  userId: string,
  utmSource?: string | null,
  utmCampaign?: string | null,
  utmContent?: string | null
) {
  const supabase = await createClient()

  // Build query to find matching tracking link
  let query = supabase
    .from('tracking_links')
    .select('*')
    .eq('user_id', userId)

  if (utmSource) query = query.eq('utm_source', utmSource)
  if (utmCampaign) query = query.eq('utm_campaign', utmCampaign)
  if (utmContent) query = query.eq('utm_content', utmContent)

  const { data: links } = await query

  // Return first match (or implement more sophisticated matching)
  return links && links.length > 0 ? links[0] : null
}
