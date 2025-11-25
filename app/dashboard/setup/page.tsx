'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [existingKeyPrefix, setExistingKeyPrefix] = useState<string>('')
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
        if (keys.length > 0) {
          setHasExistingKey(true)
          setExistingKeyPrefix(keys[0].key_prefix)
        }
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
    : '<script src="https://app.postprofit.io/track.js" data-api-key="YOUR_API_KEY"></script>'

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
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Getting Started</h1>
              <p className="text-sm text-[var(--text-muted)]">Set up revenue tracking in 4 steps</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[var(--border-light)] border-t-[var(--accent-green)] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: API Key */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-green)] text-white text-sm font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Generate API Key</h2>
              </div>

              {!apiKey && !hasExistingKey && (
                <div>
                  <p className="text-[var(--text-secondary)] mb-4">
                    Your API key authenticates your website with PostProfit for tracking.
                  </p>
                  <button
                    onClick={generateNewKey}
                    disabled={generating}
                    className="px-5 py-2.5 bg-[var(--accent-green)] text-white font-medium rounded-xl hover:bg-[var(--accent-green)]/90 transition-colors disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              )}

              {!apiKey && hasExistingKey && (
                <div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <p className="text-amber-800 text-sm">
                      You already have an API key starting with <code className="font-mono font-bold">{existingKeyPrefix}...</code>
                    </p>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Need a new key? This will revoke your old one.
                  </p>
                  <button
                    onClick={generateNewKey}
                    disabled={generating}
                    className="px-5 py-2.5 bg-[var(--accent-green)] text-white font-medium rounded-xl hover:bg-[var(--accent-green)]/90 transition-colors disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Regenerate Key'}
                  </button>
                </div>
              )}

              {apiKey && (
                <div>
                  <div className="p-4 bg-[var(--accent-green-light)] border border-[var(--accent-green)]/20 rounded-xl mb-4">
                    <p className="text-[var(--accent-green)] text-sm font-medium">
                      Copy this key now - you won&apos;t see it again!
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-xl">
                    <code className="flex-1 text-sm font-mono text-[var(--text-primary)] break-all">{apiKey}</code>
                    <button
                      onClick={() => copyToClipboard(apiKey, 'key')}
                      className="px-4 py-2 bg-[var(--accent-green)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-green)]/90 transition-colors flex-shrink-0"
                    >
                      {copied === 'key' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Install Snippet */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-green)] text-white text-sm font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Install Tracking Snippet</h2>
              </div>

              <p className="text-[var(--text-secondary)] mb-4">
                Add this code to your website before the closing <code className="px-1.5 py-0.5 bg-[var(--bg-primary)] rounded text-[var(--accent-green)] font-mono text-sm">&lt;/body&gt;</code> tag.
              </p>

              <div className="bg-slate-900 p-4 rounded-xl overflow-x-auto mb-4">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all">
                  {snippet}
                </pre>
              </div>

              <button
                onClick={() => copyToClipboard(snippet, 'snippet')}
                disabled={!apiKey && !hasExistingKey}
                className="px-5 py-2.5 bg-[var(--accent-green)] text-white font-medium rounded-xl hover:bg-[var(--accent-green)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === 'snippet' ? 'Copied!' : 'Copy Snippet'}
              </button>

              <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-xl">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Where to paste:</p>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>WordPress: Theme footer or &quot;Insert Headers and Footers&quot; plugin</li>
                  <li>Shopify: Theme → Edit code → theme.liquid</li>
                  <li>Webflow: Project Settings → Custom Code → Footer</li>
                </ul>
              </div>
            </div>

            {/* Step 3: Connect Stripe */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-green)] text-white text-sm font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Connect Stripe</h2>
              </div>

              <p className="text-[var(--text-secondary)] mb-4">
                Connect your Stripe account to automatically track purchases.
              </p>

              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-5 py-2.5 bg-[#635BFF] text-white font-medium rounded-xl hover:bg-[#635BFF]/90 transition-colors"
              >
                Go to Settings
              </button>
            </div>

            {/* Step 4: Create Campaign */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-green)] text-white text-sm font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Your First Campaign</h2>
              </div>

              <p className="text-[var(--text-secondary)] mb-4">
                Create a tracking link to use in ManyChat, your Instagram bio, or boosted posts.
              </p>

              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 bg-[var(--accent-green)] text-white font-medium rounded-xl hover:bg-[var(--accent-green)]/90 transition-colors"
              >
                Create Campaign
              </button>
            </div>

            {/* How It Works */}
            <div className="card p-6 bg-[var(--accent-green-light)] border-[var(--accent-green)]/20">
              <h3 className="font-bold text-[var(--text-primary)] mb-4">How It Works</h3>
              <ol className="space-y-2 text-[var(--text-secondary)]">
                <li><strong>1.</strong> Create a campaign → Get your tracking link</li>
                <li><strong>2.</strong> Share the link in ManyChat or social media</li>
                <li><strong>3.</strong> Customer clicks → Our snippet captures the campaign</li>
                <li><strong>4.</strong> Customer buys → Revenue automatically attributed</li>
                <li><strong>5.</strong> Dashboard shows which content drives sales!</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
