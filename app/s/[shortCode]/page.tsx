"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function InterstitialPage() {
  const params = useParams()
  const router = useRouter()
  const shortCode = params.shortCode as string

  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(3)
  const [canSkip, setCanSkip] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the original URL
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch(`/api/redirect/${shortCode}`)
        if (!response.ok) {
          setError("Short URL not found")
          setLoading(false)
          return
        }
        const data = await response.json()
        setOriginalUrl(data.originalUrl)
        setLoading(false)

        // Record impression
        recordImpression(shortCode)
      } catch (err) {
        setError("Failed to load URL")
        setLoading(false)
      }
    }

    fetchUrl()
  }, [shortCode])

  // Load Google AdSense script
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
      const script = document.createElement("script")
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)

      // Push ads after script loads
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!originalUrl || timeLeft === 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
      if (timeLeft === 1) {
        setCanSkip(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, originalUrl])

  // Auto-redirect when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && originalUrl) {
      window.location.href = originalUrl
    }
  }, [timeLeft, originalUrl])

  const handleSkipAd = () => {
    if (originalUrl) {
      window.location.href = originalUrl
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Ad Container */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Ad Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <p className="text-white text-sm font-semibold">Sponsored Content</p>
          </div>

          {/* Ad Content */}
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-white text-2xl font-bold">Ad</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Content Ahead</h2>
            <p className="text-slate-600 mb-6">
              This link is monetized. Please wait while we load the destination page.
            </p>

            <div className="bg-slate-100 rounded-lg p-6 mb-6 min-h-[250px] flex items-center justify-center border-2 border-dashed border-slate-300">
              {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ? (
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", height: "250px" }}
                  data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
                  data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              ) : (
                <div className="text-center">
                  <p className="text-slate-500 text-sm mb-2">Google AdSense</p>
                  <p className="text-slate-400 text-xs">Add NEXT_PUBLIC_ADSENSE_CLIENT_ID to environment variables</p>
                </div>
              )}
            </div>

            {/* Timer and Skip Button */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{timeLeft}</span>
                </div>
                <p className="text-slate-600 text-sm">
                  {timeLeft > 0 ? `Redirecting in ${timeLeft} second${timeLeft !== 1 ? "s" : ""}...` : "Redirecting..."}
                </p>
              </div>

              {canSkip && (
                <Button
                  onClick={handleSkipAd}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Skip Ad & Continue
                </Button>
              )}

              {!canSkip && (
                <Button
                  disabled
                  className="w-full bg-slate-300 text-slate-500 font-semibold py-2 rounded-lg cursor-not-allowed"
                >
                  Skip Ad & Continue
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">By continuing, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  )
}

async function recordImpression(shortCode: string) {
  try {
    await fetch(`/api/impression/${shortCode}`, { method: "POST" })
  } catch (error) {
    console.error("Failed to record impression:", error)
  }
}
