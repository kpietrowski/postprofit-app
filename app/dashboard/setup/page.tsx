'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState<'key' | 'snippet' | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchApiKey()
  }, [])

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const keys = await response.json()
        if (keys.length > 0) {
          setApiKey(keys[0].key_prefix)
        }
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'key' | 'snippet') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const snippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/track.js" data-api-key="${apiKey}"></script>`

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
              <h1 className="text-2xl font-bold text-gray-900">Getting Started</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Step 1: Your API Key */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold mr-3">
                  1
                </span>
                <h2 className="text-xl font-bold text-gray-900">Your API Key</h2>
              </div>
              <p className="text-gray-600 mb-4">
                This key authenticates your tracking requests. Keep it secure!
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm break-all flex items-center justify-between">
                <span>{apiKey}...</span>
                <button
                  onClick={() => copyToClipboard(apiKey, 'key')}
                  className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs whitespace-nowrap"
                >
                  {copied === 'key' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Step 2: Add Tracking Snippet */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold mr-3">
                  2
                </span>
                <h2 className="text-xl font-bold text-gray-900">Install Tracking Snippet</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Add this snippet to your website, just before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag.
              </p>
              <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{snippet}</code>
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(snippet, 'snippet')}
                className="mt-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                {copied === 'snippet' ? '✓ Copied to Clipboard!' : 'Copy Snippet'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Where to paste:</p>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>WordPress: Theme footer or plugin like "Insert Headers and Footers"</li>
                  <li>Shopify: Theme → Edit code → theme.liquid before &lt;/body&gt;</li>
                  <li>Webflow: Project Settings → Custom Code → Footer Code</li>
                  <li>Custom site: In your HTML template footer</li>
                </ul>
              </div>
            </div>

            {/* Step 3: Connect Stripe */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold mr-3">
                  3
                </span>
                <h2 className="text-xl font-bold text-gray-900">Connect Stripe</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Connect your Stripe account so we can automatically track purchases from checkout sessions.
              </p>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                Go to Settings →
              </button>
            </div>

            {/* Step 4: Create Campaign */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold mr-3">
                  4
                </span>
                <h2 className="text-xl font-bold text-gray-900">Create Your First Campaign</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Create a campaign to get a tracking link for your Instagram video, TikTok, or boosted post.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Create Campaign →
              </button>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
              <ol className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Create a campaign → Get your custom tracking link</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Share link in ManyChat, Instagram bio, or boosted posts</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Customer clicks → Our snippet captures the campaign</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Customer purchases → Revenue automatically attributed</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>Dashboard shows which content drives sales! 📊</span>
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
