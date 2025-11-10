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
  const [timeLeft, setTimeLeft] = useState(1)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto" />
        <p className="text-slate-300 text-lg font-medium">Loading your page...</p>
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
