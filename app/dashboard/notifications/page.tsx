"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, CheckCircle, Clock, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notification {
  id: number
  type: string
  message: string
  is_read: boolean
  created_at: string
  url_id: number
  short_code: string
  title: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    fetchNotifications()
  }, [router])

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch("/api/notifications", {
        headers: {
          "x-user-id": user.id,
          "x-user-email": user.email,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.email,
        },
        body: JSON.stringify({ notificationId }),
      })

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center">Loading notifications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-slate-300">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "No unread notifications"}
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-xl font-semibold mb-2">No notifications</h2>
            <p className="text-slate-600">You&apos;re all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 transition-all ${notification.is_read ? "bg-white" : "bg-blue-50 border-blue-200"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notification.type === "expiry_warning" ? (
                        <Clock className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-semibold text-slate-900">
                        {notification.type === "expiry_warning" ? "Expiry Warning" : "Link Deleted"}
                      </span>
                      {!notification.is_read && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-slate-700 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Link: {notification.title || notification.short_code}</span>
                      <span>•</span>
                      <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
