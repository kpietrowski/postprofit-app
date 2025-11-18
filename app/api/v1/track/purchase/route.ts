import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Public API endpoint for tracking purchases
 * Authenticated via API key in Authorization header
 */
export async function POST(request: Request) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer '

    // Hash the API key to look it up
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

    // Verify API key and get user
    const supabase = await createClient()
    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, revoked_at')
      .eq('key_hash', keyHash)
      .single()

    if (keyError || !apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    if (apiKeyRecord.revoked_at) {
      return NextResponse.json(
        { error: 'API key has been revoked' },
        { status: 401 }
      )
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash)

    // Parse request body
    const body = await request.json()
    const { campaign_id, utm_campaign, amount, customer_id, metadata } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      )
    }

    if (!campaign_id && !utm_campaign) {
      return NextResponse.json(
        { error: 'campaign_id or utm_campaign is required' },
        { status: 400 }
      )
    }

    // Find matching tracking link
    let trackingLink
    if (campaign_id) {
      // Direct campaign ID match
      const { data } = await supabase
        .from('tracking_links')
        .select('*')
        .eq('user_id', apiKeyRecord.user_id)
        .eq('utm_campaign', campaign_id)
        .single()
      trackingLink = data
    } else if (utm_campaign) {
      // UTM campaign match
      const { data } = await supabase
        .from('tracking_links')
        .select('*')
        .eq('user_id', apiKeyRecord.user_id)
        .eq('utm_campaign', utm_campaign)
        .single()
      trackingLink = data
    }

    if (!trackingLink) {
      return NextResponse.json(
        { error: 'No matching campaign found', campaign_id: campaign_id || utm_campaign },
        { status: 404 }
      )
    }

    // Create revenue entry
    const { data: revenueEntry, error: revenueError } = await supabase
      .from('revenue_entries')
      .insert({
        user_id: apiKeyRecord.user_id,
        tracking_link_id: trackingLink.id,
        amount: parseFloat(amount),
        description: metadata?.description || `Automatic tracking via API`,
        source: 'automatic',
        processor: 'api',
        entry_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (revenueError) {
      console.error('Error creating revenue entry:', revenueError)
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      revenue_entry_id: revenueEntry.id,
      campaign: trackingLink.title,
      amount: revenueEntry.amount
    })

  } catch (error: any) {
    console.error('Purchase tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Enable CORS for cross-origin requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
