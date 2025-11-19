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

  return (
    <div className="relative group h-full">
      <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-lg"></div>
      <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/20 transition-all duration-300 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <h2 className="text-2xl font-serif text-slate-200">Track Revenue</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-300 rounded-xl font-sans text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-900/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 rounded-xl font-sans text-sm font-semibold">
            Revenue added successfully!
          </div>
        )}

        {links.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-slate-400 font-sans mb-2 text-center">No tracking links yet</p>
            <p className="text-sm text-slate-600 font-sans text-center">Create a campaign link first</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label htmlFor="link" className="block text-sm font-sans font-semibold text-slate-400 mb-2 tracking-wide uppercase text-xs">
                Select Content *
              </label>
              <select
                id="link"
                value={selectedLinkId}
                onChange={(e) => setSelectedLinkId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg font-sans text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              >
                <option value="">Choose a campaign...</option>
                {links.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.title} ({link.platform})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-sans font-semibold text-slate-400 mb-2 tracking-wide uppercase text-xs">
                Revenue Amount ($) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="99.99"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label htmlFor="description" className="block text-sm font-sans font-semibold text-slate-400 mb-2 tracking-wide uppercase text-xs">
                Description <span className="text-slate-600 normal-case">(Optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                placeholder="Add notes about this sale..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-sans font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-auto"
            >
              {loading ? 'Adding...' : 'Add Revenue'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
