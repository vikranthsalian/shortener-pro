"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Copy, Check, Loader2 } from "lucide-react"

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
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white"
                  onClick={() => {
                    localStorage.removeItem("user")
                    setUser(null)
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div></div>
            )}
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

              {user && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Link Expiry</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value as "7days" | "1month" | "never")}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="7days">Expire in 7 days</option>
                    <option value="1month">Expire in 1 month</option>
                    <option value="never">Never expire</option>
                  </select>
                </div>
              )}

              {!user && (
                <div className="bg-amber-900/30 border border-amber-700 text-amber-200 px-4 py-3 rounded-lg text-sm">
                  <p className="font-semibold mb-1">⏰ Note: Your link will expire in 7 days</p>
                  <p className="text-xs opacity-90">Sign in to create permanent links or customize expiry settings.</p>
                </div>
              )}

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
                  <Button variant="ghost" onClick={handleCopy} className="text-slate-300 hover:text-white">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
