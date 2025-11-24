import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Short link redirect handler
 * Tracks clicks and redirects to destination URL
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  try {
    const { shortcode } = await params
    const supabase = await createClient()

    // Look up tracking link by short code
    const { data: trackingLink, error } = await supabase
      .from('tracking_links')
      .select('id, full_tracking_url, clicks')
      .eq('short_code', shortcode)
      .single()

    if (error || !trackingLink) {
      // Redirect to main site if link not found
      return NextResponse.redirect(new URL('https://app.postprofit.io', request.url))
    }

    // Increment click count (fire and forget for speed)
    void supabase
      .from('tracking_links')
      .update({ clicks: (trackingLink.clicks || 0) + 1 })
      .eq('id', trackingLink.id)
      .then(() => {
        console.log(`[Click Tracking] Incremented clicks for ${shortcode}`)
      })
      .catch((err: unknown) => {
        console.error(`[Click Tracking] Error incrementing clicks:`, err)
      })

    // Immediately redirect to destination (don't wait for click update)
    return NextResponse.redirect(trackingLink.full_tracking_url, {
      status: 307, // Temporary redirect
    })
  } catch (error) {
    console.error('[Short Link] Error:', error)
    return NextResponse.redirect(new URL('https://app.postprofit.io', request.url))
  }
}
