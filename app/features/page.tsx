"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  Zap,
  Globe,
  Lock,
  Clock,
  Target,
  Users,
  Link2,
  Smartphone,
} from "lucide-react"
import Navbar from "@/components/navbar"

export default function FeaturesPage() {
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
            <a href="/features" className="text-white font-semibold">
              Features
            </a>
             <a href="/blog" className="text-slate-300 hover:text-white transition">
              Blogs
            </a>
            <a href="/how-it-works" className="text-slate-300 hover:text-white transition">
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
          <h1 className="text-5xl font-bold text-white mb-6">Powerful Features for Modern Marketers</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Everything you need to create, track, and monetize your short links. Built for businesses, marketers, and
            content creators.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <TrendingUp className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Advanced Analytics</h3>
            <p className="text-slate-300">
              Track every click with detailed analytics including geographic data, device information, browser stats,
              and time-based patterns.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <BarChart3 className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Real-Time Dashboard</h3>
            <p className="text-slate-300">
              Monitor all your links in one place with comprehensive dashboards showing performance metrics and trends.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <DollarSign className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Link Monetization</h3>
            <p className="text-slate-300">
              Earn money from every click with our integrated ad platform. Turn your short links into revenue streams.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Link2 className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Custom Short URLs</h3>
            <p className="text-slate-300">
              Create branded short links with custom titles and memorable codes that represent your brand.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Clock className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Expiring Links</h3>
            <p className="text-slate-300">
              Set expiration dates for your links. Choose from 7 days, 1 month, or never expire options.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Globe className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Geographic Tracking</h3>
            <p className="text-slate-300">
              See exactly where your clicks are coming from with country and city-level geographic data.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Smartphone className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Device Detection</h3>
            <p className="text-slate-300">
              Understand your audience better with detailed device, operating system, and browser analytics.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Shield className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Secure & Reliable</h3>
            <p className="text-slate-300">
              Enterprise-grade security with SSL encryption and 99.9% uptime guarantee for all your links.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Zap className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
            <p className="text-slate-300">
              Instant redirects with global CDN ensuring your links load in milliseconds anywhere in the world.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Target className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Click Tracking</h3>
            <p className="text-slate-300">
              Track impressions, clicks, and CTR with precise analytics to optimize your marketing campaigns.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Lock className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">User Authentication</h3>
            <p className="text-slate-300">
              Secure login with email/password or Google OAuth. Keep your links organized and private.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
            <Users className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Team Collaboration</h3>
            <p className="text-slate-300">
              Share and manage links across your team with role-based access controls (coming soon).
            </p>
          </Card>
        </section>

        {/* CTA Section 
        <section className="text-center bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of marketers and businesses using Shortner Pro to create powerful short links.
          </p>
          <Button onClick={() => router.push("/dashboard")} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Start for Free
          </Button>
        </section>*/}
      </main>
    </div>
  )
}
