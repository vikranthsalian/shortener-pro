"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse user from localStorage")
      }
    }
  }, [])

  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            SP
          </div>
          <h1 className="text-white font-bold text-2xl">Shortner Pro</h1>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-slate-300 hover:text-white transition">
            Features
          </Link>
          <Link href="/how-it-works" className="text-slate-300 hover:text-white transition">
            How it Works
          </Link>
          {/* <Link href="/blog" className="text-slate-300 hover:text-white transition">
            Blog
          </Link> */}
          {/* <Link href="/resources" className="text-slate-300 hover:text-white transition">
            Resources
          </Link> */}
          <Link href="/faq" className="text-slate-300 hover:text-white transition">
            FAQ
          </Link>
          <Link href="/contact" className="text-slate-300 hover:text-white transition">
            Contact
          </Link>
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
                  router.push("/")
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
          <div> </div>
            
          )}
        </div>
      </nav>
    </header>
  )
}
