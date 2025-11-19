'use client'

import { useEffect, useState } from 'react'

interface TrackingLink {
  id: string
  title: string
  platform: string
  full_tracking_url: string
  total_revenue: number
  clicks: number
  created_at: string
}

export default function LinksList() {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
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

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      instagram: '📸',
      tiktok: '🎵',
      youtube: '▶️',
      twitter: '🐦',
      other: '🔗',
    }
    return icons[platform] || '🔗'
  }

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      instagram: 'bg-pink-50 text-pink-700 border-pink-200',
      tiktok: 'bg-stone-100 text-stone-700 border-stone-300',
      youtube: 'bg-red-50 text-red-700 border-red-200',
      twitter: 'bg-blue-50 text-blue-700 border-blue-200',
      other: 'bg-stone-50 text-stone-700 border-stone-200',
    }
    return colors[platform] || 'bg-stone-50 text-stone-700 border-stone-200'
  }

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <p className="text-stone-600 font-sans">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-rose-100/30 rounded-2xl blur-lg"></div>
      <div className="relative bg-white/70 backdrop-blur-xl border border-orange-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-serif text-slate-900">Your Campaigns</h2>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <p className="text-stone-600 font-sans mb-2">No campaigns yet</p>
            <p className="text-sm text-stone-500 font-sans">Create your first tracking link above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-white border border-orange-200 rounded-xl p-5 hover:bg-orange-50/30 hover:border-orange-300 hover:shadow-md transition-all duration-300 group/item"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-2xl flex-shrink-0">{getPlatformIcon(link.platform)}</span>
                      <h3 className="text-lg font-serif text-slate-900 group-hover/item:text-orange-700 transition-colors truncate">{link.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-sans font-semibold rounded-lg border ${getPlatformColor(link.platform)} capitalize flex-shrink-0`}
                      >
                        {link.platform}
                      </span>
                    </div>

                    <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 mb-4">
                      <p className="text-sm text-slate-900 font-mono break-all">{link.full_tracking_url}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-stone-500 font-sans">Revenue: </span>
                        <span className="font-sans font-bold text-slate-900">
                          ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-sans">Created: </span>
                        <span className="font-sans font-semibold text-slate-900">
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(link.full_tracking_url, link.id)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 text-sm"
                    >
                      {copiedId === link.id ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-red-50 text-red-700 font-sans font-semibold rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
