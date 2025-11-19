import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-orange-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-serif text-slate-900">PostProfit</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-stone-600 hover:text-slate-900 font-sans font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-6 leading-tight">
              Know Exactly Which Posts Drive Your Sales
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 font-sans mb-8 leading-relaxed">
              Stop guessing which Instagram reels, TikToks, or boosted posts actually make you money.
              Track revenue from every piece of content you create.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-sans font-bold rounded-lg text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
              >
                Start Tracking Free →
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-900 font-sans font-semibold rounded-lg text-lg border-2 border-orange-200 hover:border-orange-300 hover:bg-white transition-all"
              >
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-stone-500 font-sans mt-4">No credit card required • Setup in 5 minutes</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              You're Creating Content in the Dark
            </h2>
            <p className="text-xl text-stone-600 font-sans max-w-3xl mx-auto">
              Creators spend hours making Instagram reels, TikToks, and YouTube videos...
              but have no idea which ones actually drive revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <div className="text-4xl mb-4">😵‍💫</div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">Wasting Time</h3>
              <p className="text-stone-600 font-sans">
                You create 10 videos but only 2 drive sales. Which ones? You have no clue.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">Boosting Blind</h3>
              <p className="text-stone-600 font-sans">
                Spending ad budget on posts that might not convert. No data to back it up.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <div className="text-4xl mb-4">🤷</div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">Guessing Game</h3>
              <p className="text-stone-600 font-sans">
                "I think this video did well..." but you can't prove it with real revenue data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              Dead Simple Setup
            </h2>
            <p className="text-xl text-stone-600 font-sans max-w-3xl mx-auto">
              Track revenue in 4 easy steps. No complex integrations or developer needed.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Create Your Campaign",
                description: "Give your Instagram reel, TikTok, or YouTube video a name. We'll generate a unique tracking link.",
                icon: "🎬"
              },
              {
                step: "2",
                title: "Share Your Link",
                description: "Use it in ManyChat auto-replies, Instagram bio, TikTok link-in-bio, or boosted post buttons.",
                icon: "📱"
              },
              {
                step: "3",
                title: "Customer Clicks & Buys",
                description: "When they click your link and purchase on your site, we automatically track which content drove it.",
                icon: "💳"
              },
              {
                step: "4",
                title: "See What Works",
                description: "Your dashboard shows exactly which videos are making you money. Double down on what works.",
                icon: "📊"
              }
            ].map((step) => (
              <div key={step.step} className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white text-3xl font-bold font-sans shadow-xl">
                  {step.step}
                </div>
                <div className="flex-1 bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h3 className="text-2xl font-serif text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-lg text-stone-600 font-sans">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case Section */}
      <section className="py-20 bg-gradient-to-r from-orange-100 to-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              Perfect For Creators Like You
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-serif text-slate-900 mb-4">📸 Instagram Creators</h3>
              <p className="text-stone-600 font-sans mb-4">
                Posting reels about your wedding photography business? Track which reels actually book clients.
              </p>
              <p className="text-sm text-orange-600 font-sans font-semibold">
                "My morning routine reel drove $2,400 in bookings!" - Wedding Photographer
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-serif text-slate-900 mb-4">🎵 TikTok Sellers</h3>
              <p className="text-stone-600 font-sans mb-4">
                Selling digital products or courses? See exactly which TikToks convert browsers to buyers.
              </p>
              <p className="text-sm text-orange-600 font-sans font-semibold">
                "That trending audio video made me $890!" - Course Creator
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-serif text-slate-900 mb-4">💬 ManyChat Users</h3>
              <p className="text-stone-600 font-sans mb-4">
                Using auto-replies to send links? Know which automated flows actually drive sales.
              </p>
              <p className="text-sm text-orange-600 font-sans font-semibold">
                "My DM automation brought in $1,200 this week!" - Coach
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-serif text-slate-900 mb-4">💰 E-commerce Brands</h3>
              <p className="text-stone-600 font-sans mb-4">
                Boosting posts to drive product sales? Track ROI on every single promoted piece of content.
              </p>
              <p className="text-sm text-orange-600 font-sans font-semibold">
                "Spent $50 boosting, made $650!" - Boutique Owner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "5-Minute Setup", desc: "Copy one snippet, paste on your site. That's it." },
              { icon: "🔗", title: "Unlimited Links", desc: "Create tracking links for every piece of content you make." },
              { icon: "💳", title: "Stripe Integration", desc: "Automatically track purchases from your Stripe checkout." },
              { icon: "📊", title: "Real-Time Analytics", desc: "See revenue updates the moment someone buys." },
              { icon: "🎯", title: "UTM Tracking", desc: "Works with standard UTM parameters you already know." },
              { icon: "🔒", title: "Secure & Private", desc: "Your data is encrypted and stays yours. Always." }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-serif text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-stone-600 font-sans">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-rose-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
             style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FFFFFF\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Start Tracking What Actually Works
          </h2>
          <p className="text-xl text-white/90 font-sans mb-8">
            Join creators who stopped guessing and started knowing which content drives real revenue.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-slate-900 font-sans font-bold rounded-lg text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free →
          </Link>
          <p className="text-white/80 font-sans mt-4">No credit card • Setup in 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-serif text-white mb-4">PostProfit</h3>
            <p className="text-slate-400 font-sans mb-6">Revenue attribution for content creators</p>
            <div className="flex justify-center gap-6">
              <Link href="/login" className="text-slate-400 hover:text-white font-sans transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="text-slate-400 hover:text-white font-sans transition-colors">
                Sign Up
              </Link>
            </div>
            <p className="text-slate-500 font-sans text-sm mt-8">
              © 2024 PostProfit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
