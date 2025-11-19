'use client'

import { useState } from 'react'

interface LinkGeneratorProps {
  onLinkCreated: () => void
}

export default function LinkGenerator({ onLinkCreated }: LinkGeneratorProps) {
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('social')
  const [utmContent, setUtmContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/tracking-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          platform,
          destination_url: destinationUrl,
          utm_campaign: utmCampaign || title.toLowerCase().replace(/\s+/g, '_'),
          utm_source: utmSource || platform,
          utm_medium: utmMedium,
          utm_content: utmContent,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create tracking link')
      }

      const link = await response.json()
      setGeneratedLink(link)
      setSuccess(true)

      // Reset form
      setTitle('')
      setDestinationUrl('')
      setUtmCampaign('')
      setUtmSource('')
      setUtmMedium('social')
      setUtmContent('')

      onLinkCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-rose-200/20 rounded-2xl blur-lg"></div>
      <div className="relative bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all duration-300 h-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-serif text-stone-800">Create Campaign Link</h2>
        </div>
        <p className="text-stone-600 font-sans text-sm mb-6">
          Generate tracking links for ManyChat auto-replies or boosted posts
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-sans">
            {error}
          </div>
        )}

        {success && generatedLink && (
          <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full blur-2xl"></div>
            <p className="text-green-700 font-sans font-semibold mb-2 relative">Campaign link created!</p>
            <p className="text-sm text-stone-600 font-sans mb-3 relative">Use this link in your social media:</p>
            <div className="bg-white p-4 rounded-lg border border-green-200 break-all relative">
              <p className="text-sm font-mono text-stone-700 mb-3">{generatedLink.full_tracking_url}</p>
              <button
                onClick={() => copyToClipboard(generatedLink.full_tracking_url)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="title" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                Content Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                placeholder="Morning Routine Video"
              />
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                Platform *
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="destinationUrl" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
              Your Website URL *
            </label>
            <input
              id="destinationUrl"
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              placeholder="https://weddings.chatoptimized.io"
            />
            <p className="mt-2 text-xs text-stone-500 font-sans">
              This must be YOUR domain where you have the tracking snippet installed
            </p>
          </div>

          <div className="border-t border-orange-200 pt-5">
            <h3 className="text-lg font-serif text-stone-800 mb-4">UTM Parameters <span className="text-stone-500 text-sm font-sans">(Optional)</span></h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="utmSource" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                  UTM Source
                </label>
                <input
                  id="utmSource"
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="Auto-filled from platform"
                />
              </div>

              <div>
                <label htmlFor="utmMedium" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                  UTM Medium
                </label>
                <input
                  id="utmMedium"
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="social"
                />
              </div>

              <div>
                <label htmlFor="utmCampaign" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                  UTM Campaign
                </label>
                <input
                  id="utmCampaign"
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="Auto-filled from title"
                />
              </div>

              <div>
                <label htmlFor="utmContent" className="block text-sm font-sans font-semibold text-stone-700 mb-2 tracking-wide uppercase text-xs">
                  UTM Content
                </label>
                <input
                  id="utmContent"
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-bold rounded-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {loading ? 'Creating...' : 'Generate Tracking Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
