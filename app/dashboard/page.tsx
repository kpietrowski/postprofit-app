'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LinkGenerator from '@/components/LinkGenerator'
import RevenueTracker from '@/components/RevenueTracker'
import LinksList from '@/components/LinksList'
import Analytics from '@/components/Analytics'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
      setTimeout(() => setMounted(true), 50)
    }

    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-[var(--accent-green)] rounded-full animate-spin"></div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Search */}
            <div className={`flex items-center gap-8 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-green)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-[var(--text-primary)]">PostProfit</span>
              </div>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-light)] w-64">
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search campaigns"
                  className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none flex-1"
                />
              </div>
            </div>

            {/* Right side */}
            <div className={`flex items-center gap-3 transition-all duration-500 delay-100 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {/* Notification bell */}
              <button className="p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors">
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User avatar & dropdown */}
              <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-light)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-pink)] flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-[var(--text-secondary)] hidden md:block max-w-[150px] truncate">
                  {user?.email}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-light)]">
                <button
                  onClick={() => router.push('/dashboard/setup')}
                  className="px-4 py-2 bg-[var(--accent-green)] text-white text-sm font-medium rounded-full hover:bg-[var(--accent-green)]/90 transition-colors"
                >
                  Setup
                </button>
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="px-4 py-2 text-[var(--text-secondary)] text-sm font-medium rounded-full hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-[var(--text-muted)] text-sm hover:text-[var(--text-secondary)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Title */}
        <div className={`mb-8 transition-all duration-500 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Dashboard</h1>
          <p className="text-[var(--text-secondary)] text-sm">Track your social media revenue attribution</p>
        </div>

        {/* Analytics Section */}
        <div className={`mb-8 transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Analytics key={refreshKey} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Link Generator - 3 columns */}
          <div className={`lg:col-span-3 transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <LinkGenerator onLinkCreated={handleRefresh} />
          </div>

          {/* Revenue Tracker - 2 columns */}
          <div className={`lg:col-span-2 transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <RevenueTracker onRevenueAdded={handleRefresh} />
          </div>
        </div>

        {/* Links List */}
        <div className={`transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <LinksList key={refreshKey} />
        </div>
      </main>
    </div>
  )
}
