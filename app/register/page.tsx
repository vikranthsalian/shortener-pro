"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      setGoogleScriptLoaded(true)
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignUp,
        })
        window.google.accounts.id.renderButton(document.getElementById("google-signup-button"), {
          theme: "outline",
          size: "large",
          width: "100%",
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleGoogleSignUp = async (response: any) => {
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
        setError(data.error || "Google sign-up failed")
        setGoogleLoading(false)
        return
      }

      const data = await res.json()
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Google sign-up error:", err)
      setError("Failed to sign up with Google")
      setGoogleLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Submitting registration...")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Response status:", response.status)

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] Non-JSON response:", textResponse)
        setError("Server error. Please try again.")
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      console.log("[v0] Registration successful, redirecting to dashboard...")
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SL</span>
          </div>
          <h1 className="text-2xl font-bold text-white text-center">ShortLink</h1>
          <p className="text-slate-400 text-center text-sm mt-2">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <div className="mb-6">
          <div id="google-signup-button" className="w-full"></div>
          {!googleScriptLoaded && (
            <div className="w-full bg-slate-700 text-slate-300 py-3 rounded-lg text-center text-sm">
              Loading Google Sign-Up...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or sign up with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </a>
        </p>
      </Card>
    </div>
  )
}
