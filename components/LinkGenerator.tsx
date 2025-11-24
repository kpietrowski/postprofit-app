'use client'

import { useState } from 'react'

interface LinkGeneratorProps {
  onLinkCreated: () => void
}

const platformOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'other', label: 'Other' },
]

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
  const [showUtm, setShowUtm] = useState(false)

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
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  return (
    <div className="card p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Campaign</h2>
          <p className="text-sm text-[var(--text-muted)]">Generate a trackable link for your content</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-green-light)] flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && generatedLink && (
        <div className="mb-4 p-4 bg-[var(--accent-green-light)] border border-[var(--accent-green)]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[var(--accent-green)] font-medium text-sm">Link created successfully!</p>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
            <code className="text-sm text-[var(--text-primary)] flex-1 truncate font-mono">
              {generatedLink.short_link_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/l/${generatedLink.short_code}`}
            </code>
            <button
              onClick={() => copyToClipboard(generatedLink.short_link_url || `${window.location.origin}/l/${generatedLink.short_code}`)}
              className="px-3 py-1.5 bg-[var(--accent-green)] text-white text-xs font-medium rounded-lg hover:bg-[var(--accent-green)]/90 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Platform Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Content Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)] transition-all text-sm"
              placeholder="Morning Routine Video"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)] transition-all text-sm cursor-pointer"
            >
              {platformOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination URL */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Destination URL
          </label>
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] focus:ring-1 focus:ring-[var(--accent-green)] transition-all text-sm"
            placeholder="https://yourwebsite.com"
          />
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Your domain with the tracking snippet installed
          </p>
        </div>

        {/* UTM Toggle */}
        <button
          type="button"
          onClick={() => setShowUtm(!showUtm)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showUtm ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          UTM Parameters (Optional)
        </button>

        {/* UTM Fields */}
        {showUtm && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                UTM Source
              </label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] transition-all text-sm"
                placeholder="Auto from platform"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                UTM Medium
              </label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] transition-all text-sm"
                placeholder="social"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                UTM Campaign
              </label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] transition-all text-sm"
                placeholder="Auto from title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                UTM Content
              </label>
              <input
                type="text"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] transition-all text-sm"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[var(--accent-green)] text-white font-medium rounded-xl hover:bg-[var(--accent-green)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Link
            </>
          )}
        </button>
      </form>
    </div>
  )
}
