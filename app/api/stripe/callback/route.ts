import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { encrypt } from '@/lib/encryption'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Handles Stripe Connect OAuth callback
 * Exchanges authorization code for access token and stores connection
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Stripe OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Invalid callback parameters', request.url)
    )
  }

  try {
    // Decode and verify state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
    const { userId, timestamp } = stateData

    // Check state is not too old (5 minutes)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      throw new Error('OAuth state expired')
    }

    // Exchange authorization code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const {
      access_token,
      refresh_token,
      token_type,
      stripe_user_id,
      scope,
    } = response

    if (!access_token || !stripe_user_id) {
      throw new Error('Missing access token or account ID from Stripe')
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(access_token)
    const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null

    // Store connection in database
    const supabase = await createClient()

    const { data: connection, error: dbError } = await supabase
      .from('payment_connections')
      .upsert({
        user_id: userId,
        provider: 'stripe',
        account_id: stripe_user_id,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        scope,
        token_type,
        status: 'active',
        metadata: {
          connected_at: new Date().toISOString(),
        },
      }, {
        onConflict: 'user_id,provider,account_id'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save connection')
    }

    // Setup webhook for this account
    try {
      await setupStripeWebhook(stripe_user_id, access_token)
    } catch (webhookError) {
      console.warn('Failed to setup webhook:', webhookError)
      // Don't fail the connection if webhook setup fails
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/dashboard/settings?connected=stripe', request.url)
    )

  } catch (err: any) {
    console.error('Stripe Connect callback error:', err)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(err.message)}`, request.url)
    )
  }
}

/**
 * Sets up webhook endpoint for connected Stripe account
 */
async function setupStripeWebhook(accountId: string, accessToken: string) {
  const stripe = new Stripe(accessToken, {
    apiVersion: '2023-10-16',
  })

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`

  // Check if webhook already exists
  const existingWebhooks = await stripe.webhookEndpoints.list()
  const existing = existingWebhooks.data.find(wh => wh.url === webhookUrl)

  if (existing) {
    return existing
  }

  // Create new webhook
  const webhook = await stripe.webhookEndpoints.create({
    url: webhookUrl,
    enabled_events: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'charge.succeeded',
    ],
  })

  return webhook
}
