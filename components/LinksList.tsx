'use client'

import { useEffect, useState } from 'react'

interface TrackingLink {
  id: string
  title: string
  platform: string
  full_tracking_url: string
  short_code: string
  total_revenue: number
  clicks: number
  created_at: string
}

const platformConfig: Record<string, { icon: string; color: string; bgColor: string; label: string }> = {
  instagram: {
    icon: '📸',
    color: '#E4405F',
    bgColor: '#FDF2F8',
    label: 'Instagram'
  },
  tiktok: {
    icon: '🎵',
    color: '#000000',
    bgColor: '#F5F5F5',
    label: 'TikTok'
  },
  youtube: {
    icon: '▶️',
    color: '#FF0000',
    bgColor: '#FEF2F2',
    label: 'YouTube'
  },
  twitter: {
    icon: '𝕏',
    color: '#000000',
    bgColor: '#F5F5F5',
    label: 'Twitter'
  },
  other: {
    icon: '🔗',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    label: 'Other'
  },
}

export default function LinksList() {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'short' | 'full' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

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
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string, type: 'short' | 'full') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setCopiedType(type)
      setTimeout(() => {
        setCopiedId(null)
        setCopiedType(null)
      }, 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracking link?')) {
      return
    }

    try {
      const response = await fetch(`/api/tracking-links/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLinks(links.filter(link => link.id !== id))
      } else {
        alert('Failed to delete link')
      }
    } catch (error) {
      alert('Failed to delete link')
    }
  }

  const filteredLinks = links
    .filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlatform = platformFilter === 'all' || link.platform === platformFilter
      return matchesSearch && matchesPlatform
    })

  const availablePlatforms = [...new Set(links.map(link => link.platform))]

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[var(--accent-green)] rounded-full animate-pulse"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Campaigns</h2>
          <p className="text-sm text-[var(--text-muted)]">{links.length} total links</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] w-48">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none flex-1"
            />
          </div>

          {/* Platform filter dropdown */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] text-sm text-[var(--text-primary)] outline-none cursor-pointer"
          >
            <option value="all">All Platforms</option>
            {availablePlatforms.map(platform => {
              const config = platformConfig[platform] || platformConfig.other
              return (
                <option key={platform} value={platform}>{config.label}</option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Links Grid */}
      {links.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-[var(--text-primary)] font-medium mb-1">No campaigns yet</p>
          <p className="text-sm text-[var(--text-muted)]">Create your first tracking link above to get started</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No campaigns match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const config = platformConfig[link.platform] || platformConfig.other
            const shortLinkUrl = typeof window !== 'undefined'
              ? `${window.location.origin}/l/${link.short_code}`
              : `app.postprofit.io/l/${link.short_code}`

            return (
              <div
                key={link.id}
                className="group p-4 rounded-2xl border border-[var(--border-light)] hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-md)] transition-all duration-200 bg-white"
              >
                <div className="flex items-start gap-4">
                  {/* Platform Icon */}
                  <div
                    className="platform-icon flex-shrink-0 mt-1"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {config.icon}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-[var(--text-primary)] font-medium truncate">{link.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{ backgroundColor: config.bgColor, color: config.color }}
                          >
                            {config.label}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Link Options */}
                    <div className="space-y-2 mb-3">
                      {/* Short Link - for ManyChat/DMs */}
                      <div className="flex items-center gap-2 p-2 bg-[var(--bg-primary)] rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Short Link (for ManyChat/DMs)</p>
                          <code className="text-xs text-[var(--text-secondary)] truncate font-mono block">
                            {shortLinkUrl}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(shortLinkUrl, link.id, 'short')}
                          className="px-3 py-1.5 bg-[var(--accent-green)] text-white text-xs font-medium rounded-lg hover:bg-[var(--accent-green)]/90 transition-colors flex-shrink-0"
                        >
                          {copiedId === link.id && copiedType === 'short' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Full URL - for Ads */}
                      <div className="flex items-center gap-2 p-2 bg-[var(--bg-primary)] rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Full URL (for Ads Manager)</p>
                          <code className="text-xs text-[var(--text-secondary)] truncate font-mono block">
                            {link.full_tracking_url}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(link.full_tracking_url, link.id, 'full')}
                          className="px-3 py-1.5 bg-[var(--accent-purple)] text-white text-xs font-medium rounded-lg hover:bg-[var(--accent-purple)]/90 transition-colors flex-shrink-0"
                        >
                          {copiedId === link.id && copiedType === 'full' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Clicks</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">{link.clicks || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Revenue</p>
                        <p className="text-lg font-bold text-[var(--accent-green)]">
                          ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">$/Click</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                          ${link.clicks > 0 ? (parseFloat(link.total_revenue.toString()) / link.clicks).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
