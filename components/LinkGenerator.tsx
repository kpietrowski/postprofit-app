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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Tracking Link</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && generatedLink && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold mb-2">Link created successfully!</p>
          <div className="bg-white p-3 rounded border border-green-300 break-all">
            <p className="text-sm text-gray-700 mb-2">{generatedLink.full_tracking_url}</p>
            <button
              onClick={() => copyToClipboard(generatedLink.full_tracking_url)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Content Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Morning Routine Video"
            />
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
              Platform *
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
          <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Destination URL *
          </label>
          <input
            id="destinationUrl"
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            placeholder="https://yoursite.com/product"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">UTM Parameters (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="utmSource" className="block text-sm font-medium text-gray-700 mb-1">
                UTM Source
              </label>
              <input
                id="utmSource"
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Auto-filled from platform"
              />
            </div>

            <div>
              <label htmlFor="utmMedium" className="block text-sm font-medium text-gray-700 mb-1">
                UTM Medium
              </label>
              <input
                id="utmMedium"
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="social"
              />
            </div>

            <div>
              <label htmlFor="utmCampaign" className="block text-sm font-medium text-gray-700 mb-1">
                UTM Campaign
              </label>
              <input
                id="utmCampaign"
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Auto-filled from title"
              />
            </div>

            <div>
              <label htmlFor="utmContent" className="block text-sm font-medium text-gray-700 mb-1">
                UTM Content
              </label>
              <input
                id="utmContent"
                type="text"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Generate Tracking Link'}
        </button>
      </form>
    </div>
  )
}
