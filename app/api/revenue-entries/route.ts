import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all revenue entries for the authenticated user
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tracking_link_id = searchParams.get('tracking_link_id')

  let query = supabase
    .from('revenue_entries')
    .select('*, tracking_links(title, platform)')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  // Filter by tracking link if provided
  if (tracking_link_id) {
    query = query.eq('tracking_link_id', tracking_link_id)
  }

  const { data: entries, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(entries)
}

// POST create a new revenue entry
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { tracking_link_id, amount, description, entry_date } = body

  // Validate required fields
  if (!tracking_link_id || amount === undefined || amount < 0) {
    return NextResponse.json(
      { error: 'Tracking link ID and amount (>= 0) are required' },
      { status: 400 }
    )
  }

  const { data: entry, error } = await supabase
    .from('revenue_entries')
    .insert({
      user_id: user.id,
      tracking_link_id,
      amount,
      description,
      entry_date: entry_date || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(entry, { status: 201 })
}
