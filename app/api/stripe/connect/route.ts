import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Initiates Stripe Connect OAuth flow
 * Redirects user to Stripe to authorize access to their account
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const stripeClientId = process.env.STRIPE_CLIENT_ID

  if (!stripeClientId) {
    return NextResponse.json(
      { error: 'Stripe Connect not configured' },
      { status: 500 }
    )
  }

  // Generate state parameter for CSRF protection
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now()
  })).toString('base64')

  // Build Stripe Connect OAuth URL
  const params = new URLSearchParams({
    client_id: stripeClientId,
    state,
    response_type: 'code',
    scope: 'read_write',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/callback`,
  })

  const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(stripeOAuthUrl)
}
