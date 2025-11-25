"use client"

import { Button } from "@/components/ui/button"
import { Bell, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function DashboardNav() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; name?: string; image?: string } | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored)
        setUser(parsedUser)

        // Fetch unread notifications count
        fetch("/api/notifications", {
          headers: {
            "x-user-id": parsedUser.id,
            "x-user-email": parsedUser.email,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            const unread = data.filter((n: { read: boolean }) => !n.read).length
            setUnreadNotifications(unread)
          })
          .catch(() => {})
      } catch (e) {
        console.error("Failed to parse user from localStorage")
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
          <h1 className="text-white font-bold text-xl hidden sm:block">Shortner Pro</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" className="text-slate-300 hover:text-white relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            {user?.image && (
              <img src={user.image || "/placeholder.svg"} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
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
          <Link href="/dashboard/notifications">
            <Button variant="outline" className="w-full relative bg-transparent">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-slate-300 mb-3">
            {user?.image && (
              <img src={user.image || "/placeholder.svg"} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
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
  )
}
