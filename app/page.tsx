"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, ExternalLink, TrendingUp, Shield, BarChart3, Zap } from "lucide-react"
import { Toaster } from "sonner"
import Navbar from "@/components/navbar"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [expiry, setExpiry] = useState<"7days" | "1month" | "never">("7days")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const googleScript = document.createElement("script")
    googleScript.src = "https://accounts.google.com/gsi/client"
    googleScript.async = true
    googleScript.defer = true
    googleScript.onload = () => {
      setGoogleScriptLoaded(true)
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        })
        window.google.accounts.id.renderButton(document.getElementById("google-signin-button-home"), {
          theme: "outline",
          size: "large",
          width: "100%",
        })
      }
    }
    document.body.appendChild(googleScript)

    return () => {
      if (document.body.contains(googleScript)) {
        document.body.removeChild(googleScript)
      }
    }
  }, [])

  const handleGoogleSignIn = async (response: any) => {
    setGoogleLoading(true)
    setError(null)

    try {
      const base64Url = response.credential.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      const googleUser = JSON.parse(jsonPayload)

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Google sign-in failed")
        setGoogleLoading(false)
        return
      }

      const data = await res.json()
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Google sign-in error:", err)
      setError("Failed to sign in with Google")
      setGoogleLoading(false)
    }
  }

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          title: title || undefined,
          userId: user?.id || null,
          expiry: user ? expiry : "7days", // Non-logged-in users always get 7 days
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to shorten URL")
        setLoading(false)
        return
      }

      const data = await response.json()
      setShortUrl(data.shortUrl)
      setOriginalUrl("")
      setTitle("")
      setExpiry("7days")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      <Toaster />

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Your Links, Shorter & Smarter</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Create professional short links, track detailed analytics, and monetize every click with Shortner Pro. The
            easiest URL shortener for businesses and marketers.
          </p>
        </section>

        {/* Main Form Card */}
        <div className="max-w-7xl mx-auto mb-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Ad */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs text-center mb-2">Advertisement</p>
                  <div className="bg-slate-900 rounded-lg flex items-center justify-center h-[600px]">
                    {/* Advertisement code here */}
                  </div>
                </Card>
              </div>
            </div>

            {/* Center Form */}
            <div className="lg:col-span-6">
              <Card className="bg-slate-800 border-slate-700 p-8">
                <form onSubmit={handleShorten} className="space-y-4" aria-label="Create short link form">
                  <div>
                    <Label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="original-url">
                      Original URL
                    </Label>
                    <Input
                      id="original-url"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      aria-label="Enter the URL you want to shorten"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="link-title">
                      Title (Optional)
                    </Label>
                    <Input
                      id="link-title"
                      type="text"
                      placeholder="My awesome link"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400"
                      aria-label="Optional title for your short link"
                    />
                  </div>

                  {user && (
                    <div>
                      <Label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="link-expiry">
                        Link Expiry
                      </Label>
                      <Select
                        id="link-expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value as "7days" | "1month" | "never")}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                        aria-label="Choose link expiry option"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7days">Expire in 7 days</SelectItem>
                          <SelectItem value="1month">Expire in 1 month</SelectItem>
                          <SelectItem value="never">Never expire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!user && (
                    <div
                      className="bg-amber-900/30 border border-amber-700 text-amber-200 px-4 py-3 rounded-lg text-sm"
                      role="alert"
                    >
                      <p className="font-semibold mb-1">⏰ Note: Your link will expire in 7 days</p>
                      <p className="text-xs opacity-90">
                        Sign in to create permanent links or customize expiry settings.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div
                      className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !originalUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10"
                  >
                    {loading ? (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Short Link"
                    )}
                  </Button>

                  {!user && (
                    <>
                      <div className="text-center mb-6 mt-6">
                        <p className="text-slate-300 font-medium mb-4">OR</p>
                      </div>
                      <div id="google-signin-button-home" className="mb-4"></div>

                      {!googleScriptLoaded && (
                        <div className="w-full bg-slate-700 text-slate-300 py-3 rounded-lg text-center text-sm">
                          Loading Google Sign-In...
                        </div>
                      )}
                    </>
                  )}
                </form>
              </Card>
            </div>

            {/* Right Ad */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <p className="text-slate-400 text-xs text-center mb-2">Advertisement</p>
                  <div className="bg-slate-900 rounded-lg flex items-center justify-center h-[600px]">
                    {/* Advertisement code here */}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {shortUrl && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700 p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-green-400" />
                  <p className="text-green-200 font-semibold">Link created successfully!</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-blue-300 font-mono text-sm break-all">{shortUrl}</code>
                  <Button variant="ghost" onClick={handleCopy} className="text-slate-300 hover:text-white">
                    {copied ? (
                      <ExternalLink className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <section className="mt-24 mb-12">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Why Choose Shortner Pro?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition">
              <TrendingUp className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h4>
              <p className="text-slate-300 text-sm">
                Track every click with detailed analytics including device info, location data, and click patterns.
              </p>
            </article>

            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition">
              <BarChart3 className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Dashboard</h4>
              <p className="text-slate-300 text-sm">
                Monitor your links in real-time with comprehensive dashboards and detailed performance reports.
              </p>
            </article>

            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-indigo-500 transition">
              <Zap className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Monetize Your Links</h4>
              <p className="text-slate-300 text-sm">
                Earn money from every click with our integrated monetization platform and ad network.
              </p>
            </article>
          </div>
        </section>

        {/* Detailed Description Section */}
        <section className="mt-24 mb-12 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">
              The Most Powerful URL Shortener for Modern Marketers
            </h3>
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p className="text-lg">
                Shortner Pro is more than just a URL shortener—it's a complete link management platform designed for
                professionals who need deep insights into their audience behavior. Whether you're a content creator,
                digital marketer, or business owner, our platform gives you the tools to transform simple links into
                powerful marketing assets.
              </p>
              <p>
                Every shortened link created with Shortner Pro comes with comprehensive tracking capabilities. Monitor
                click-through rates, understand your audience demographics, and discover which channels drive the most
                engagement. Our real-time analytics dashboard provides hourly, daily, and monthly breakdowns, giving you
                the data you need to optimize your campaigns and maximize ROI.
              </p>
              <p>
                With built-in monetization features, you can turn your links into revenue streams. Our platform
                seamlessly integrates advertising opportunities, allowing you to earn money from every click while
                maintaining a smooth user experience. Track your earnings in real-time and watch your link portfolio
                grow into a profitable asset.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-24 mb-12">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Built for Performance & Trust</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <article className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Enterprise Security</h4>
              <p className="text-slate-300">
                Your data is protected with enterprise-grade security. All links are encrypted and stored securely with
                regular backups. We never share your data with third parties and maintain strict privacy standards.
              </p>
            </article>

            <article className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Lightning Fast</h4>
              <p className="text-slate-300">
                Experience blazing fast redirect speeds powered by global CDN infrastructure. Your shortened links load
                instantly from any location, ensuring minimal latency and maximum user satisfaction for your audience.
              </p>
            </article>

            <article className="text-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Trusted by Thousands</h4>
              <p className="text-slate-300">
                Join thousands of marketers, businesses, and content creators who trust Shortner Pro for their link
                management needs. Our platform processes millions of clicks every month with 99.9% uptime reliability.
              </p>
            </article>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mt-24 mb-12 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Perfect for Every Use Case</h3>
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-semibold text-white mb-3">Social Media Marketing</h4>
              <p className="text-slate-300">
                Create clean, branded short links perfect for social media posts. Track which platforms drive the most
                engagement and optimize your content strategy based on real data. Our links work seamlessly across
                Twitter, Facebook, Instagram, LinkedIn, and more.
              </p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-semibold text-white mb-3">Email Campaigns</h4>
              <p className="text-slate-300">
                Shorten long URLs for cleaner email designs and better click-through rates. Track email campaign
                performance with detailed analytics showing opens, clicks, and conversions. Understand which email
                segments respond best to your content.
              </p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-semibold text-white mb-3">Content Creators & Influencers</h4>
              <p className="text-slate-300">
                Monetize your audience by adding revenue-generating short links to your content. Track which videos,
                posts, or articles drive the most engagement. Build your brand with custom short links that are easy to
                remember and share.
              </p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h4 className="text-xl font-semibold text-white mb-3">Digital Agencies</h4>
              <p className="text-slate-300">
                Manage multiple client campaigns with comprehensive analytics dashboards. Create branded short links for
                each client and provide detailed performance reports. Track ROI across different channels and
                demonstrate the value of your marketing efforts.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section 
        <section className="mt-24 mb-12 text-center">
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-12 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users who trust Shortner Pro for their link management needs. Create your first short
              link today—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
              >
                Sign Up Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/features")}
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>*/}
      </main>
    </div>
  )
}
