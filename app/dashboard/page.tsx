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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Creator Revenue Tracker</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        <div className="mb-8">
          <Analytics key={refreshKey} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Link Generator */}
          <div>
            <LinkGenerator onLinkCreated={handleRefresh} />
          </div>

          {/* Revenue Tracker */}
          <div>
            <RevenueTracker onRevenueAdded={handleRefresh} />
          </div>
        </div>

        {/* Links List */}
        <div>
          <LinksList key={refreshKey} />
        </div>
      </main>
    </div>
  )
}
