'use client'

import { useEffect, useState } from 'react'

interface TrackingLink {
  id: string
  title: string
  platform: string
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

export default function Analytics() {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [platformStats, setPlatformStats] = useState<Record<string, { revenue: number; clicks: number; count: number }>>({})

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/tracking-links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)

        // Calculate totals
        const total = data.reduce((sum: number, link: TrackingLink) =>
          sum + parseFloat(link.total_revenue.toString()), 0
        )
        setTotalRevenue(total)

        const clicks = data.reduce((sum: number, link: TrackingLink) =>
          sum + (link.clicks || 0), 0
        )
        setTotalClicks(clicks)

        // Calculate per-platform stats
        const stats: Record<string, { revenue: number; clicks: number; count: number }> = {}
        data.forEach((link: TrackingLink) => {
          const platform = link.platform || 'other'
          if (!stats[platform]) {
            stats[platform] = { revenue: 0, clicks: 0, count: 0 }
          }
          stats[platform].revenue += parseFloat(link.total_revenue.toString())
          stats[platform].clicks += link.clicks || 0
          stats[platform].count += 1
        })
        setPlatformStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLinks = platformFilter === 'all'
    ? links
    : links.filter(link => link.platform === platformFilter)

  const availablePlatforms = Object.keys(platformStats)

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[var(--accent-green)] rounded-full animate-pulse"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlatformFilter('all')}
          className={`pill ${platformFilter === 'all' ? 'pill-active' : 'bg-white border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-medium)]'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          All
        </button>
        {availablePlatforms.map(platform => {
          const config = platformConfig[platform] || platformConfig.other
          return (
            <button
              key={platform}
              onClick={() => setPlatformFilter(platform)}
              className={`pill ${platformFilter === platform ? 'pill-active' : 'bg-white border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-medium)]'}`}
              style={platformFilter === platform ? {} : { backgroundColor: config.bgColor }}
            >
              <span>{config.icon}</span>
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue Card - Hero */}
        <div className="md:col-span-2 card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-[var(--text-secondary)] text-sm">from {links.length} campaigns</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-green-light)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="metric-large text-[var(--accent-green)]">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          {/* Mini bar chart */}
          <div className="mt-6 flex items-end gap-1 h-16">
            {[...Array(12)].map((_, i) => {
              const height = Math.random() * 80 + 20
              return (
                <div
                  key={i}
                  className="flex-1 bg-[var(--accent-green)] rounded-t-md opacity-20"
                  style={{
                    height: `${height}%`,
                    backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                  }}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Clicks</p>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue-light)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-1">link clicks</p>
        </div>

        {/* Conversion Rate */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Avg. Value/Click</p>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple-light)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--accent-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
            ${totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : '0.00'}
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-1">per click</p>
        </div>
      </div>

      {/* Platform Cards Grid */}
      {Object.keys(platformStats).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(platformStats)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .map(([platform, stats]) => {
              const config = platformConfig[platform] || platformConfig.other
              const conversionRate = stats.clicks > 0 ? (stats.revenue / stats.clicks * 100) : 0

              return (
                <div
                  key={platform}
                  className="card p-5 cursor-pointer group"
                  onClick={() => setPlatformFilter(platform === platformFilter ? 'all' : platform)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="platform-icon"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        {config.icon}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{config.label}</span>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {stats.count}
                    </div>
                  </div>

                  <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-1">
                    ${stats.revenue.toFixed(0)}
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-light)]">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Clicks</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{stats.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">$/Click</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        ${stats.clicks > 0 ? (stats.revenue / stats.clicks).toFixed(2) : '0'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Top Performers */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Revenue */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Top Revenue</h3>
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <div className="space-y-3">
              {filteredLinks
                .sort((a, b) => parseFloat(b.total_revenue.toString()) - parseFloat(a.total_revenue.toString()))
                .slice(0, 5)
                .map((link, index) => {
                  const config = platformConfig[link.platform] || platformConfig.other
                  return (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-primary)] transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)] group-hover:bg-white">
                        {index + 1}
                      </div>
                      <div
                        className="platform-icon flex-shrink-0"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{link.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{link.clicks || 0} clicks</p>
                      </div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        ${parseFloat(link.total_revenue.toString()).toFixed(0)}
                      </p>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top Clicks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Most Clicked</h3>
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <div className="space-y-3">
              {filteredLinks
                .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                .slice(0, 5)
                .map((link, index) => {
                  const config = platformConfig[link.platform] || platformConfig.other
                  return (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-primary)] transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)] group-hover:bg-white">
                        {index + 1}
                      </div>
                      <div
                        className="platform-icon flex-shrink-0"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{link.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">${parseFloat(link.total_revenue.toString()).toFixed(0)} revenue</p>
                      </div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {link.clicks || 0}
                      </p>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
