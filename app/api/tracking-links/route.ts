import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all tracking links for the authenticated user
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: links, error } = await supabase
    .from('tracking_links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(links)
}

// POST create a new tracking link
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, platform, destination_url, utm_campaign, utm_source, utm_medium, utm_content, utm_term } = body

  // Validate required fields
  if (!title || !platform || !destination_url) {
    return NextResponse.json(
      { error: 'Title, platform, and destination URL are required' },
      { status: 400 }
    )
  }

  // Build UTM parameters
  const url = new URL(destination_url)
  if (utm_source) url.searchParams.set('utm_source', utm_source)
  if (utm_medium) url.searchParams.set('utm_medium', utm_medium)
  if (utm_campaign) url.searchParams.set('utm_campaign', utm_campaign)
  if (utm_term) url.searchParams.set('utm_term', utm_term)
  if (utm_content) url.searchParams.set('utm_content', utm_content)

  const full_tracking_url = url.toString()

  // Generate a short code (simplified - you might want to use a proper URL shortener)
  const short_code = Math.random().toString(36).substring(2, 8)

  const { data: link, error } = await supabase
    .from('tracking_links')
    .insert({
      user_id: user.id,
      title,
      platform,
      destination_url,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      short_code,
      full_tracking_url,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(link, { status: 201 })
}
