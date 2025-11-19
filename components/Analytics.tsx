'use client'

import { useEffect, useState } from 'react'

interface TrackingLink {
  id: string
  title: string
  platform: string
  total_revenue: number
  clicks: number
}

export default function Analytics() {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [topPerformer, setTopPerformer] = useState<TrackingLink | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/tracking-links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)

        // Calculate total revenue
        const total = data.reduce((sum: number, link: TrackingLink) =>
          sum + parseFloat(link.total_revenue.toString()), 0
        )
        setTotalRevenue(total)

        // Find top performer
        const top = data.reduce((prev: TrackingLink | null, current: TrackingLink) => {
          if (!prev) return current
          return parseFloat(current.total_revenue.toString()) > parseFloat(prev.total_revenue.toString())
            ? current
            : prev
        }, null)
        setTopPerformer(top)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-slate-400 font-sans">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue - Prominent */}
        <div className="md:col-span-2 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-all duration-300">
            <p className="text-sm font-sans font-semibold text-emerald-400/80 mb-2 tracking-wider uppercase">Total Revenue</p>
            <p className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 mb-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-slate-500 font-sans text-sm">from {links.length} campaigns</p>
          </div>
        </div>

        {/* Tracking Links Count */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <p className="text-sm font-sans font-semibold text-cyan-400/80 mb-2 tracking-wider uppercase">Active Links</p>
            <p className="text-5xl font-serif text-cyan-300 mb-2">{links.length}</p>
            <p className="text-slate-500 font-sans text-sm">campaigns</p>
          </div>
        </div>
      </div>

      {/* Top Performer & Top 5 */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performer Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl blur-lg"></div>
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-sans font-semibold text-emerald-400/80 tracking-wider uppercase">Top Performer</h3>
              </div>
              {topPerformer ? (
                <>
                  <p className="text-2xl font-serif text-slate-200 mb-2 truncate">{topPerformer.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      ${parseFloat(topPerformer.total_revenue.toString()).toFixed(2)}
                    </p>
                    <p className="text-slate-500 font-sans text-sm capitalize">{topPerformer.platform}</p>
                  </div>
                </>
              ) : (
                <p className="text-lg font-sans text-slate-500">No campaigns yet</p>
              )}
            </div>
          </div>

          {/* Top 5 List */}
          <div className="relative">
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-sm font-sans font-semibold text-slate-400 mb-4 tracking-wider uppercase">Top Revenue Generators</h3>
              <div className="space-y-3">
                {links
                  .sort((a, b) => parseFloat(b.total_revenue.toString()) - parseFloat(a.total_revenue.toString()))
                  .slice(0, 5)
                  .map((link, index) => (
                    <div key={link.id} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-emerald-400 font-sans font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-slate-300 truncate group-hover:text-emerald-300 transition-colors">{link.title}</p>
                        <p className="text-xs text-slate-500 capitalize">{link.platform}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-sans font-bold text-emerald-400">
                          ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
