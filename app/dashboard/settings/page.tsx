'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PaymentConnection {
  id: string
  provider: string
  account_id: string
  status: string
  created_at: string
}

export default function SettingsPage() {
  const [connections, setConnections] = useState<PaymentConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setConnected(params.get('connected'))
      setError(params.get('error'))
    }
  }, [])

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/payment-connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data)
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = () => {
    window.location.href = '/api/stripe/connect'
  }

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this payment processor?')) {
      return
    }

    try {
      const response = await fetch(`/api/payment-connections/${connectionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConnections(connections.filter(c => c.id !== connectionId))
      } else {
        alert('Failed to disconnect')
      }
    } catch (error) {
      alert('Failed to disconnect')
    }
  }

  const stripeConnection = connections.find(c => c.provider === 'stripe')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
              <p className="text-sm text-[var(--text-muted)]">Manage your integrations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Success Message */}
        {connected && (
          <div className="mb-6 p-4 bg-[var(--accent-green-light)] border border-[var(--accent-green)]/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--accent-green)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-[var(--accent-green)]">Successfully connected Stripe!</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Your revenue will now be tracked automatically.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-700">Connection Error</p>
              <p className="text-sm text-red-600 mt-1">{decodeURIComponent(error)}</p>
            </div>
          </div>
        )}

        {/* Payment Processors */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Payment Processors</h2>
              <p className="text-sm text-[var(--text-muted)]">Connect to automatically track revenue</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-[var(--border-light)] border-t-[var(--accent-green)] rounded-full animate-spin"></div>
              <p className="text-[var(--text-secondary)]">Loading connections...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stripe */}
              <div className="p-5 border border-[var(--border-light)] rounded-xl hover:border-[var(--border-medium)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#635BFF">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Stripe</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {stripeConnection
                          ? `Connected: ${stripeConnection.account_id.slice(0, 12)}...`
                          : 'Track payments automatically'
                        }
                      </p>
                    </div>
                  </div>

                  {stripeConnection ? (
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[var(--accent-green-light)] text-[var(--accent-green)] text-xs font-medium rounded-full">
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnect(stripeConnection.id)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      className="px-5 py-2.5 bg-[#635BFF] text-white text-sm font-medium rounded-xl hover:bg-[#635BFF]/90 transition-colors"
                    >
                      Connect Stripe
                    </button>
                  )}
                </div>
              </div>

              {/* Shopify - Coming Soon */}
              <div className="p-5 border border-[var(--border-light)] rounded-xl opacity-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#96BF48]/10 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#96BF48">
                        <path d="M15.337 3.415c-.122-.097-.244-.048-.317.024-.073.073-.902 1.073-.902 1.073s-.78-.17-.926-.195a.42.42 0 00-.39.122c-.146.122-.244.268-.268.463-.024.146-.414 3.122-.414 3.122l-2.39.512-.951-2.951c-.049-.122-.122-.195-.244-.22l-1.878-.243-.049-.024c-.097-.024-.195.024-.268.097s-.122.17-.122.293l-.78 4.805c-.024.17.073.317.244.366l1.365.366s1.072.293 1.268.341c.146.049.341-.049.39-.22l.731-2.878c0-.024.024-.024.049 0l.39 1.268s.317 1.122.366 1.268c.049.17.22.268.39.22l1.341-.341c.195-.049.317-.244.268-.439l-.78-3.39 1.195-.268c.195-.049.341-.244.317-.439 0-.097-.024-.195-.097-.268z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Shopify</h3>
                      <p className="text-sm text-[var(--text-muted)]">Coming soon</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-muted)] text-sm font-medium rounded-xl">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">How Automatic Tracking Works</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-green-light)] text-[var(--accent-green)] text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-[var(--text-secondary)]">Connect your Stripe account above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-green-light)] text-[var(--accent-green)] text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
              <span className="text-[var(--text-secondary)]">Install the tracking snippet on your website</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-green-light)] text-[var(--accent-green)] text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
              <span className="text-[var(--text-secondary)]">Create campaign links and share them on social media</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-green-light)] text-[var(--accent-green)] text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
              <span className="text-[var(--text-secondary)]">When customers purchase, revenue is automatically attributed</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
