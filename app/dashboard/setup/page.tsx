'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [copied, setCopied] = useState<'key' | 'snippet' | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkExistingKey()
  }, [])

  const checkExistingKey = async () => {
    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const keys = await response.json()
        setHasExistingKey(keys.length > 0)
      }
    } catch (error) {
      console.error('Failed to check API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewKey = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/api-keys/generate', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.api_key)
        setHasExistingKey(true)
      } else {
        alert('Failed to generate API key')
      }
    } catch (error) {
      console.error('Failed to generate API key:', error)
      alert('Failed to generate API key')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: 'key' | 'snippet') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const snippet = apiKey
    ? `<script src="https://app.postprofit.io/track.js" data-api-key="${apiKey}"></script>`
    : '<script src="https://app.postprofit.io/track.js" data-api-key="YOUR_API_KEY_HERE"></script>'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-orange-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-stone-600 hover:text-stone-900 font-sans"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-serif text-slate-900">Getting Started</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600 font-sans">Loading...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Step 1: Your API Key */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-orange-200">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold font-sans mr-3">
                  1
                </span>
                <h2 className="text-xl font-serif text-slate-900">Your API Key</h2>
              </div>

              {!apiKey && !hasExistingKey && (
                <div className="space-y-4">
                  <p className="text-stone-600 font-sans">
                    Generate your API key to start tracking revenue. This key authenticates your tracking requests.
                  </p>
                  <button
                    onClick={generateNewKey}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              )}

              {!apiKey && hasExistingKey && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 font-sans text-sm">
                      ⚠️ You already have an API key, but for security reasons we can only show it once when generated.
                    </p>
                  </div>
                  <p className="text-stone-600 font-sans">
                    If you lost your key, generate a new one below. This will revoke your old key.
                  </p>
                  <button
                    onClick={generateNewKey}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate New API Key'}
                  </button>
                </div>
              )}

              {apiKey && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-sans text-sm font-semibold mb-2">
                      ✓ API Key Generated Successfully!
                    </p>
                    <p className="text-green-700 font-sans text-sm">
                      ⚠️ Copy this key now - you won't be able to see it again after leaving this page!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-orange-200 font-mono text-sm break-all">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-900">{apiKey}</span>
                      <button
                        onClick={() => copyToClipboard(apiKey, 'key')}
                        className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all text-xs font-semibold whitespace-nowrap"
                      >
                        {copied === 'key' ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Install Tracking Snippet */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-orange-200">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold font-sans mr-3">
                  2
                </span>
                <h2 className="text-xl font-serif text-slate-900">Install Tracking Snippet</h2>
              </div>
              <p className="text-stone-600 font-sans mb-4">
                Add this snippet to your website, just before the closing <code className="bg-orange-100 px-2 py-1 rounded text-orange-700 font-mono text-sm">&lt;/body&gt;</code> tag.
              </p>

              {!apiKey && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                  <p className="text-amber-800 font-sans text-sm">
                    Generate your API key above first, then the snippet will be ready to copy!
                  </p>
                </div>
              )}

              <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
                  <code>{snippet}</code>
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(snippet, 'snippet')}
                disabled={!apiKey}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === 'snippet' ? '✓ Copied to Clipboard!' : 'Copy Snippet'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900 font-sans font-semibold mb-2">💡 Where to paste:</p>
                <ul className="list-disc list-inside text-sm text-blue-800 font-sans space-y-1">
                  <li>WordPress: Theme footer or plugin like "Insert Headers and Footers"</li>
                  <li>Shopify: Theme → Edit code → theme.liquid before &lt;/body&gt;</li>
                  <li>Webflow: Project Settings → Custom Code → Footer Code</li>
                  <li>Custom site: In your HTML template footer</li>
                </ul>
              </div>
            </div>

            {/* Step 3: Connect Stripe */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-orange-200">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold font-sans mr-3">
                  3
                </span>
                <h2 className="text-xl font-serif text-slate-900">Connect Stripe (Optional)</h2>
              </div>
              <p className="text-stone-600 font-sans mb-4">
                Connect your Stripe account to automatically track purchases from checkout sessions.
              </p>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Go to Settings →
              </button>
            </div>

            {/* Step 4: Create Campaign */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-orange-200">
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold font-sans mr-3">
                  4
                </span>
                <h2 className="text-xl font-serif text-slate-900">Create Your First Campaign</h2>
              </div>
              <p className="text-stone-600 font-sans mb-4">
                Create a campaign to get a tracking link for your Instagram video, TikTok, or boosted post.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                Create Campaign →
              </button>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-orange-100 to-rose-100 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-serif text-slate-900 mb-4">How It Works</h3>
              <ol className="space-y-3 text-stone-700 font-sans">
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
