"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link2, BarChart3, DollarSign, CheckCircle2 } from "lucide-react"

export default function HowItWorksPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              SP
            </div>
            <h1 className="text-white font-bold text-2xl">Shortner Pro</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/features" className="text-slate-300 hover:text-white transition">
              Features
            </a>
            <a href="/how-it-works" className="text-white font-semibold">
              How it Works
            </a>
            <a href="/faq" className="text-slate-300 hover:text-white transition">
              FAQ
            </a>
            <a href="/contact" className="text-slate-300 hover:text-white transition">
              Contact
            </a>
          </div>
      
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold text-white mb-6">How Shortner Pro Works</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Create powerful short links in seconds. Track every click, analyze your audience, and earn money from your
            content.
          </p>
        </section>

        {/* Steps Section */}
        <section className="space-y-16 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h2 className="text-3xl font-bold text-white">Create Your Short Link</h2>
              </div>
              <p className="text-slate-300 text-lg mb-4">
                Paste any long URL into Shortner Pro and get a short, memorable link in seconds. Add a custom title and
                choose your expiration settings.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>No registration required for basic links</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Custom titles for better organization</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Choose link expiration: 7 days, 1 month, or never</span>
                </li>
              </ul>
            </div>
            <Card className="bg-slate-800 border-slate-700 p-8">
              <Link2 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <p className="text-slate-400 text-sm mb-2">Original URL</p>
                <p className="text-slate-200 text-sm break-all">
                  https://example.com/very/long/url/with/many/parameters?id=123
                </p>
              </div>
              <div className="text-center text-slate-400 my-4">↓</div>
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Short URL</p>
                <p className="text-indigo-300 font-mono text-lg">shortner-pro.com/abc123</p>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="bg-slate-800 border-slate-700 p-8 order-2 md:order-1">
              <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Total Clicks</span>
                    <span className="text-white font-bold text-xl">1,234</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Desktop</p>
                    <p className="text-white font-bold">58%</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Mobile</p>
                    <p className="text-white font-bold">42%</p>
                  </div>
                </div>
              </div>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h2 className="text-3xl font-bold text-white">Track & Analyze</h2>
              </div>
              <p className="text-slate-300 text-lg mb-4">
                Get detailed insights into every click. See where your traffic comes from, what devices they use, and
                when they click.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Real-time click tracking</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Geographic data (country & city)</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Device, browser, and OS analytics</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Hourly, daily, and monthly trends</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h2 className="text-3xl font-bold text-white">Earn Money</h2>
              </div>
              <p className="text-slate-300 text-lg mb-4">
                Monetize your short links with our integrated ad platform. Every click shows a brief ad before
                redirecting, earning you money automatically.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Earn $0.50 per 1,000 impressions (CPM)</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Automatic earnings calculation</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span>Track revenue in real-time dashboard</span>
                </li>
              </ul>
            </div>
            <Card className="bg-slate-800 border-slate-700 p-8">
              <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg p-6 text-center">
                <p className="text-slate-300 mb-2">Estimated Earnings</p>
                <p className="text-4xl font-bold text-green-400 mb-4">$127.50</p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-slate-400 text-xs">Impressions</p>
                    <p className="text-white font-semibold">255,000</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Clicks</p>
                    <p className="text-white font-semibold">12,450</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section 
        <section className="text-center bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Start Creating Short Links Today</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            No credit card required. Start with unlimited free links and upgrade anytime.
          </p>
          <Button onClick={() => router.push("/dashboard")} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Get Started for Free
          </Button>
        </section>*/}
      </main>
    </div>
  )
}
