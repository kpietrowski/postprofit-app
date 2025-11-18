'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaymentConnection {
  id: string
  provider: string
  account_id: string
  status: string
  created_at: string
}

function SettingsContent() {
  const [connections, setConnections] = useState<PaymentConnection[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for connection success/error messages
  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

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

  const getProviderIcon = (provider: string) => {
    const icons: { [key: string]: string } = {
      stripe: '💳',
      shopify: '🛍️',
      paypal: '💰',
      square: '🟦',
    }
    return icons[provider] || '🔗'
  }

  const getProviderName = (provider: string) => {
    const names: { [key: string]: string } = {
      stripe: 'Stripe',
      shopify: 'Shopify',
      paypal: 'PayPal',
      square: 'Square',
    }
    return names[provider] || provider
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {connected && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <p className="font-semibold">✓ Successfully connected {getProviderName(connected)}!</p>
            <p className="text-sm mt-1">Your revenue will now be tracked automatically.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm mt-1">{decodeURIComponent(error)}</p>
          </div>
        )}

        {/* Payment Connections Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Processors</h2>
          <p className="text-gray-600 mb-6">
            Connect your payment processors to automatically track revenue from your social media content.
          </p>

          {loading ? (
            <p className="text-gray-600">Loading connections...</p>
          ) : (
            <div className="space-y-6">
              {/* Stripe Connection */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{getProviderIcon('stripe')}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
                      <p className="text-sm text-gray-600">
                        Connect your Stripe account to track payments automatically
                      </p>
                    </div>
                  </div>
                  <div>
                    {connections.find(c => c.provider === 'stripe') ? (
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded mb-2">
                          Connected
                        </span>
                        <p className="text-xs text-gray-500 mb-2">
                          Account: {connections.find(c => c.provider === 'stripe')?.account_id}
                        </p>
                        <button
                          onClick={() => handleDisconnect(connections.find(c => c.provider === 'stripe')!.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleConnectStripe}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                      >
                        Connect Stripe
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Shopify Connection (Coming Soon) */}
              <div className="border border-gray-200 rounded-lg p-6 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{getProviderIcon('shopify')}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Shopify</h3>
                      <p className="text-sm text-gray-600">
                        Connect your Shopify store (Coming soon)
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How It Works
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Connect your Stripe account above</li>
            <li>Create tracking links for your social media posts</li>
            <li>Add UTM parameters to your Stripe checkout (metadata)</li>
            <li>When customers purchase, revenue is automatically tracked</li>
            <li>View analytics to see which content drives sales</li>
          </ol>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}>
      <SettingsContent />
    </Suspense>
  )
}
