"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Copy, Trash2, TrendingUp, Eye, DollarSign, Plus, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"

interface UserLink {
  id: number
  short_code: string
  original_url: string
  title?: string
  created_at: string
  total_clicks: number
  total_impressions: number
  estimated_earnings: string
}

interface User {
  id: number
  email: string
  name?: string
  image?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchUserLinks(parsedUser.id)
  }, [router])

  const fetchUserLinks = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/links?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch links")
      const data = await response.json()
      setLinks(data.links || [])
    } catch (error) {
      console.error("[v0] Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleCopyLink = (shortCode: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(Number.parseInt(shortCode))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    try {
      const response = await fetch(`/api/user/links/${linkId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete link")
      setLinks(links.filter((l) => l.id !== linkId))
    } catch (error) {
      console.error("[v0] Error deleting link:", error)
    }
  }

  const totalStats = {
    clicks: links.reduce((sum, l) => sum + l.total_clicks, 0),
    impressions: links.reduce((sum, l) => sum + l.total_impressions, 0),
    earnings: links.reduce((sum, l) => sum + Number.parseFloat(l.estimated_earnings || "0"), 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SL</span>
            </div>
            <h1 className="text-white font-bold text-xl hidden sm:block">ShortLink</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              {user?.image && (
                <img src={user.image || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm">{user?.name || user?.email}</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 mb-3">
              {user?.image && (
                <img src={user.image || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm">{user?.name || user?.email}</span>
            </div>
            <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Links</h2>
            <p className="text-slate-400">Manage and track your shortened links</p>
          </div>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create New Link
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
                <p className="text-white text-3xl font-bold">{totalStats.clicks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Ad Impressions</p>
                <p className="text-white text-3xl font-bold">{totalStats.impressions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Est. Earnings</p>
                <p className="text-white text-3xl font-bold">${totalStats.earnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Links List */}
        {links.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-12 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No links yet</h3>
            <p className="text-slate-400 mb-6">Create your first shortened link to get started</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Your First Link</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <Card key={link.id} className="bg-slate-800 border-slate-700 p-6 hover:border-slate-600 transition">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Link Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Short Link</p>
                      <div className="flex items-center gap-2">
                        <code className="text-blue-400 font-mono text-sm bg-slate-700 px-3 py-1 rounded">
                          {process.env.NEXT_PUBLIC_BASE_URL}/s/{link.short_code}
                        </code>
                        <button
                          onClick={() => handleCopyLink(link.short_code)}
                          className={`p-2 rounded transition text-slate-400 hover:text-slate-300 ${
                            copiedId === link.id ? "bg-slate-700 text-slate-300" : ""
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Created</p>
                      <p className="text-slate-300 text-sm">{new Date(link.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-xs uppercase tracking-wide">Clicks</p>
                      <p className="text-white font-semibold">{link.total_clicks.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-xs uppercase tracking-wide">Impressions</p>
                      <p className="text-slate-300 text-sm">{link.total_impressions.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-xs uppercase tracking-wide">Earnings</p>
                      <p className="text-yellow-400 font-semibold">${link.estimated_earnings}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                    <Link href={`/analytics/${link.short_code}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:text-white bg-transparent"
                      >
                        View Analytics
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 hover:bg-red-600/20 rounded transition text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
