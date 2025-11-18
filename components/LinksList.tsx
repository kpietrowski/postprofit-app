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
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-gray-900 text-white',
      youtube: 'bg-red-100 text-red-800',
      twitter: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading links...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Tracking Links</h2>

      {links.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">No tracking links yet.</p>
          <p className="text-sm text-gray-500">Create your first tracking link above to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getPlatformColor(link.platform)}`}
                    >
                      {link.platform}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-3">
                    <p className="text-sm text-gray-600 break-all">{link.full_tracking_url}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Revenue: </span>
                      <span className="font-semibold text-green-600">
                        ${parseFloat(link.total_revenue.toString()).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created: </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => copyToClipboard(link.full_tracking_url, link.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded hover:bg-purple-700 transition"
                  >
                    {copiedId === link.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition"
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
  )
}
