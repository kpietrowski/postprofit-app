import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all payment connections for the authenticated user
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: connections, error } = await supabase
    .from('payment_connections')
    .select('id, provider, account_id, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(connections)
}
