'use client'

import { useEffect, useState } from 'react'

interface RevenueTrackerProps {
  onRevenueAdded: () => void
}

interface TrackingLink {
  id: string
  title: string
  platform: string
}

const platformIcons: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '▶️',
  twitter: '𝕏',
  other: '🔗',
}

export default function RevenueTracker({ onRevenueAdded }: RevenueTrackerProps) {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [selectedLinkId, setSelectedLinkId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/tracking-links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/revenue-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracking_link_id: selectedLinkId,
          amount: parseFloat(amount),
          description,
          entry_date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add revenue')
      }

      setSuccess(true)
      setSelectedLinkId('')
      setAmount('')
      setDescription('')

      onRevenueAdded()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedLink = links.find(l => l.id === selectedLinkId)

  return (
    <div className="card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Track Revenue</h2>
          <p className="text-sm text-[var(--text-muted)]">Log a sale from your content</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple-light)] flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--accent-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      {success && (
        <div className="mb-4 p-3 bg-[var(--accent-green-light)] border border-[var(--accent-green)]/20 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-[var(--accent-green)] font-medium text-sm">Revenue added!</p>
        </div>
      )}

      {/* No Links State */}
      {links.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-1">No campaigns yet</p>
          <p className="text-sm text-[var(--text-muted)] text-center">Create a campaign link first to start tracking revenue</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          {/* Campaign Select */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Campaign
            </label>
            <div className="relative">
              <select
                value={selectedLinkId}
                onChange={(e) => setSelectedLinkId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Select a campaign...</option>
                {links.map((link) => (
                  <option key={link.id} value={link.id}>
                    {platformIcons[link.platform] || '🔗'} {link.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Revenue Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] transition-all text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Notes <span className="normal-case text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] transition-all text-sm resize-none flex-1"
              placeholder="Add notes about this sale..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--accent-purple)] text-white font-medium rounded-xl hover:bg-[var(--accent-purple)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Revenue
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
