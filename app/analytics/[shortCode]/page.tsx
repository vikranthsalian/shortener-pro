"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Copy, TrendingUp, Eye, DollarSign } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface LinkAnalytics {
  id: number
  short_code: string
  original_url: string
  title?: string
  total_clicks: number
  total_impressions: number
  total_earnings: string
  ctr: number
}

interface DailyStats {
  date: string
  clicks: number
  impressions: number
  earnings: number
}

interface DetailedAnalytics {
  hourlyStats: Array<{ hour: number; clicks: number }>
  deviceStats: Array<{ name: string; value: number }>
  browserStats: Array<{ name: string; value: number }>
  osStats: Array<{ name: string; value: number }>
  locationStats: Array<{ country: string; city: string; clicks: number }>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const shortCode = params.shortCode as string

  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [detailedAnalytics, setDetailedAnalytics] = useState<DetailedAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchAnalytics(parsedUser.id)
  }, [router, shortCode])

  const fetchAnalytics = async (userId: string) => {
    try {
      const [analyticsRes, detailedRes] = await Promise.all([
        fetch(`/api/analytics/${shortCode}?userId=${userId}`),
        fetch(`/api/analytics/detailed/${shortCode}?userId=${userId}`),
      ])

      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics")
      const data = await analyticsRes.json()
      setAnalytics(data.analytics)
      setDailyStats(data.dailyStats || [])

      if (detailedRes.ok) {
        const detailedData = await detailedRes.json()
        setDetailedAnalytics(detailedData)
      }
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 text-center">
          <p className="text-slate-300 mb-4">Link not found</p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-white font-bold text-xl">Analytics</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Link Info */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Short Link</p>
              <div className="flex items-center gap-2">
                <code className="text-blue-400 font-mono text-sm bg-slate-700 px-3 py-2 rounded flex-1 break-all">
                  {process.env.NEXT_PUBLIC_BASE_URL}/s/{shortCode}
                </code>
                <button onClick={handleCopyLink} className="p-2 hover:bg-slate-700 rounded transition">
                  <Copy className={`w-4 h-4 ${copied ? "text-green-400" : "text-slate-400"}`} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Original URL</p>
              <p className="text-slate-300 text-sm break-all">{analytics.original_url}</p>
            </div>
            {analytics.title && (
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Title</p>
                <p className="text-slate-300 text-sm">{analytics.title}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
                <p className="text-white text-3xl font-bold">{analytics.total_clicks.toLocaleString()}</p>
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
                <p className="text-white text-3xl font-bold">{analytics.total_impressions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">CTR</p>
                <p className="text-white text-3xl font-bold">{analytics.ctr.toFixed(2)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Est. Earnings</p>
                <p className="text-white text-3xl font-bold">${Number(analytics.total_earnings).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        {dailyStats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-white font-bold mb-4">Clicks Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-white font-bold mb-4">Impressions & Earnings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="impressions" fill="#10b981" />
                  <Bar dataKey="earnings" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {detailedAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Stats */}
            {detailedAnalytics.hourlyStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Traffic by Hour</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detailedAnalytics.hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="hour" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar dataKey="clicks" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Device Stats */}
            {detailedAnalytics.deviceStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Device Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={detailedAnalytics.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {detailedAnalytics.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Browser Stats */}
            {detailedAnalytics.browserStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Top Browsers</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={detailedAnalytics.browserStats} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* OS Stats */}
            {detailedAnalytics.osStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Operating Systems</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={detailedAnalytics.osStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {detailedAnalytics.osStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Location Stats */}
            {detailedAnalytics.locationStats.length > 0 && (
              <Card className="bg-slate-800 border-slate-700 p-6 lg:col-span-2">
                <h3 className="text-white font-bold mb-4">Top Locations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-4 text-slate-400">Country</th>
                        <th className="text-left py-2 px-4 text-slate-400">City</th>
                        <th className="text-right py-2 px-4 text-slate-400">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAnalytics.locationStats.map((location, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-2 px-4 text-slate-300">{location.country}</td>
                          <td className="py-2 px-4 text-slate-300">{location.city}</td>
                          <td className="py-2 px-4 text-right text-slate-300 font-semibold">{location.clicks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
