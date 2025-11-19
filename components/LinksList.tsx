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
      instagram: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      tiktok: 'bg-slate-700/50 text-slate-200 border-slate-600/30',
      youtube: 'bg-red-500/10 text-red-300 border-red-500/20',
      twitter: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      other: 'bg-slate-600/10 text-slate-300 border-slate-600/20',
    }
    return colors[platform] || 'bg-slate-600/10 text-slate-300 border-slate-600/20'
  }

  if (loading) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
          <p className="text-slate-400 font-sans">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-slate-900/5 rounded-2xl blur-lg"></div>
      <div className="relative bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 hover:border-slate-700/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
          <h2 className="text-2xl font-serif text-slate-200">Your Campaigns</h2>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <p className="text-slate-400 font-sans mb-2">No campaigns yet</p>
            <p className="text-sm text-slate-600 font-sans">Create your first tracking link above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 hover:bg-slate-800/40 hover:border-emerald-500/20 transition-all duration-300 group/item"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-2xl flex-shrink-0">{getPlatformIcon(link.platform)}</span>
                      <h3 className="text-lg font-serif text-slate-200 group-hover/item:text-emerald-300 transition-colors truncate">{link.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-sans font-semibold rounded-lg border ${getPlatformColor(link.platform)} capitalize flex-shrink-0`}
                      >
                        {link.platform}
                      </span>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700/30 mb-4">
                      <p className="text-sm text-slate-400 font-mono break-all">{link.full_tracking_url}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-slate-500 font-sans">Revenue: </span>
                        <span className="font-sans font-bold text-emerald-400">
                          ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-sans">Created: </span>
                        <span className="font-sans font-semibold text-slate-300">
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(link.full_tracking_url, link.id)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 text-sm"
                    >
                      {copiedId === link.id ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-red-900/20 text-red-300 font-sans font-semibold rounded-lg border border-red-500/20 hover:bg-red-900/30 hover:border-red-500/30 transition-all duration-300 text-sm"
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
