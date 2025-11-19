import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// POST - Generate new API key
export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate new API key
  const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  const keyPrefix = apiKey.substring(0, 12)

  // Revoke old keys (soft delete)
  await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('revoked_at', null)

  // Insert new key
  const { error: insertError } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: 'Default API Key'
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Return the full key (this is the ONLY time they'll see it)
  return NextResponse.json({
    api_key: apiKey,
    key_prefix: keyPrefix,
    message: 'Save this key - you won\'t be able to see it again!'
  })
}
