"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Copy, Check, Loader2 } from "lucide-react"

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <h1 className="text-white font-bold text-xl">ShortLink</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Dashboard
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Shorten URLs & Earn Money</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Create short links, monetize with ads, and track analytics. Get paid for every click.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="bg-slate-800 border-slate-700 p-8">
            <form onSubmit={handleShorten} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Original URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Title (Optional)</label>
                <Input
                  type="text"
                  placeholder="My awesome link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Short Link"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Result Card */}
        {shortUrl && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700 p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <p className="text-green-200 font-semibold">Link created successfully!</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-blue-300 font-mono text-sm break-all">{shortUrl}</code>
                  <Button onClick={handleCopy} size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <p className="text-slate-300 text-sm">
                  Share this link! You'll earn money every time someone clicks it.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="text-white font-bold mb-2">Instant Monetization</h3>
            <p className="text-slate-400 text-sm">Start earning immediately with Google AdSense integration</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-white font-bold mb-2">Real-time Analytics</h3>
            <p className="text-slate-400 text-sm">Track clicks, impressions, and earnings in real-time</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">🔒</span>
            </div>
            <h3 className="text-white font-bold mb-2">Secure & Reliable</h3>
            <p className="text-slate-400 text-sm">Enterprise-grade infrastructure with 99.9% uptime</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
