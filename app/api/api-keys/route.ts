import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET user's API keys
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, last_used_at, created_at, revoked_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(apiKeys)
}
