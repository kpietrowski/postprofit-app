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
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-['Plus_Jakarta_Sans'] tracking-wide">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1628] relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/15 to-transparent blur-3xl"></div>
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h1 className="text-3xl font-['DM_Serif_Display'] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400">
                PostProfit
              </h1>
              <p className="text-slate-500 text-sm font-['Plus_Jakarta_Sans'] mt-1">Revenue Attribution Platform</p>
            </div>
            <div className={`flex items-center gap-3 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <span className="text-slate-400 text-sm font-['Plus_Jakarta_Sans'] hidden md:block">{user?.email}</span>
              <button
                onClick={() => router.push('/dashboard/setup')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
              >
                Setup
              </button>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-5 py-2.5 bg-slate-800/50 backdrop-blur-sm text-slate-300 font-['Plus_Jakarta_Sans'] font-semibold rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-emerald-500/30 transition-all duration-300"
              >
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 text-slate-400 font-['Plus_Jakarta_Sans'] hover:text-slate-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1400px] mx-auto px-8 py-12">
        {/* Analytics Section - Hero Stats */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Analytics key={refreshKey} />
        </div>

        {/* Asymmetric Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Link Generator - Takes 2 columns */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <LinkGenerator onLinkCreated={handleRefresh} />
          </div>

          {/* Revenue Tracker - Takes 1 column */}
          <div className={`lg:col-span-1 transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <RevenueTracker onRevenueAdded={handleRefresh} />
          </div>
        </div>

        {/* Links List - Full Width */}
        <div className={`transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <LinksList key={refreshKey} />
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}
