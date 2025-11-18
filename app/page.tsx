export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Creator Revenue Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track which social media content drives your sales
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            Get Started
          </a>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
