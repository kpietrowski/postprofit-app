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
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-6">
          <p className="text-sm font-medium text-purple-900 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Total Links */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-6">
          <p className="text-sm font-medium text-blue-900 mb-1">Tracking Links</p>
          <p className="text-3xl font-bold text-blue-600">{links.length}</p>
        </div>

        {/* Top Performer */}
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6">
          <p className="text-sm font-medium text-green-900 mb-1">Top Performer</p>
          {topPerformer ? (
            <>
              <p className="text-lg font-bold text-green-600 truncate">{topPerformer.title}</p>
              <p className="text-sm text-green-700">${parseFloat(topPerformer.total_revenue.toString()).toFixed(2)}</p>
            </>
          ) : (
            <p className="text-lg text-green-600">No data yet</p>
          )}
        </div>
      </div>

      {/* Top 5 Revenue Generators */}
      {links.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Generators</h3>
          <div className="space-y-3">
            {links
              .sort((a, b) => parseFloat(b.total_revenue.toString()) - parseFloat(a.total_revenue.toString()))
              .slice(0, 5)
              .map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{link.title}</p>
                    <p className="text-sm text-gray-600 capitalize">{link.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
