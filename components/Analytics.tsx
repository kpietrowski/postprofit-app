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
      <div className="bg-white/70 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <p className="text-stone-600 font-sans">Loading analytics...</p>
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/40 to-rose-200/40 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
            <p className="text-sm font-sans font-semibold text-orange-600 mb-2 tracking-wider uppercase">Total Revenue</p>
            <p className="text-6xl font-serif text-slate-900 mb-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-stone-500 font-sans text-sm">from {links.length} campaigns</p>
          </div>
        </div>

        {/* Tracking Links Count */}
        <div className="relative group">
          <div className="absolute inset-0 bg-rose-200/30 rounded-2xl blur-lg"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 hover:border-rose-300 hover:shadow-lg transition-all duration-300">
            <p className="text-sm font-sans font-semibold text-rose-600 mb-2 tracking-wider uppercase">Active Links</p>
            <p className="text-5xl font-serif text-slate-900 mb-2">{links.length}</p>
            <p className="text-stone-500 font-sans text-sm">campaigns</p>
          </div>
        </div>
      </div>

      {/* Top Performer & Top 5 */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performer Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-transparent rounded-2xl blur-lg"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-sans font-semibold text-orange-600 tracking-wider uppercase">Top Performer</h3>
              </div>
              {topPerformer ? (
                <>
                  <p className="text-2xl font-serif text-slate-900 mb-2 truncate">{topPerformer.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-sans font-bold text-slate-900">
                      ${parseFloat(topPerformer.total_revenue.toString()).toFixed(2)}
                    </p>
                    <p className="text-stone-500 font-sans text-sm capitalize">{topPerformer.platform}</p>
                  </div>
                </>
              ) : (
                <p className="text-lg font-sans text-stone-500">No campaigns yet</p>
              )}
            </div>
          </div>

          {/* Top 5 List */}
          <div className="relative">
            <div className="bg-white/70 backdrop-blur-xl border border-orange-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-sans font-semibold text-stone-700 mb-4 tracking-wider uppercase">Top Revenue Generators</h3>
              <div className="space-y-3">
                {links
                  .sort((a, b) => parseFloat(b.total_revenue.toString()) - parseFloat(a.total_revenue.toString()))
                  .slice(0, 5)
                  .map((link, index) => (
                    <div key={link.id} className="flex items-center gap-4 p-3 bg-orange-50/50 rounded-lg border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center border border-orange-200">
                        <span className="text-orange-600 font-sans font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-slate-900 truncate group-hover:text-orange-700 transition-colors">{link.title}</p>
                        <p className="text-xs text-stone-500 capitalize">{link.platform}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-sans font-bold text-slate-900">
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
