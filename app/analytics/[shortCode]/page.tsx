"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft, Copy, TrendingUp, TrendingDown, Eye, MousePointerClick, Activity } from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  ctr: number | string
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

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

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

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const getRecentTrend = () => {
    if (dailyStats.length < 2) return { clicks: 0, impressions: 0, ctr: 0 }

    const recent = dailyStats.slice(-7)
    const older = dailyStats.slice(-14, -7)

    const recentClicks = recent.reduce((sum, d) => sum + d.clicks, 0)
    const olderClicks = older.reduce((sum, d) => sum + d.clicks, 0)

    const recentImpressions = recent.reduce((sum, d) => sum + d.impressions, 0)
    const olderImpressions = older.reduce((sum, d) => sum + d.impressions, 0)

    return {
      clicks: calculateTrend(recentClicks, olderClicks),
      impressions: calculateTrend(recentImpressions, olderImpressions),
      ctr: analytics ? (typeof analytics.ctr === "string" ? Number.parseFloat(analytics.ctr) : analytics.ctr) : 0,
    }
  }

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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <p className="text-slate-300 mb-4">Link not found</p>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const trends = getRecentTrend()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-white font-bold text-xl">Link Analytics</h1>
          <div className="w-40"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Short Link</p>
                <div className="flex items-center gap-3">
                  <code className="text-indigo-400 font-mono text-sm bg-slate-900 px-4 py-2 rounded-lg flex-1">
                    {process.env.NEXT_PUBLIC_BASE_URL}/s/{shortCode}
                  </code>
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                    className={`transition border-slate-600 ${copied ? "bg-emerald-900/20 border-emerald-600 text-emerald-400" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
            {analytics.title && (
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Title</p>
                <p className="text-white text-sm font-medium">{analytics.title}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-indigo-400" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${trends.clicks >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {trends.clicks >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trends.clicks).toFixed(1)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Clicks</p>
            <p className="text-white text-3xl font-bold">{analytics.total_clicks.toLocaleString()}</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-400" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${trends.impressions >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {trends.impressions >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trends.impressions).toFixed(1)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Impressions</p>
            <p className="text-white text-3xl font-bold">{analytics.total_impressions.toLocaleString()}</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-400">
                <TrendingUp className="w-4 h-4" />
                {trends.ctr.toFixed(1)}%
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Click Rate</p>
            <p className="text-white text-3xl font-bold">
              {(typeof analytics.ctr === "string" ? Number.parseFloat(analytics.ctr) : analytics.ctr).toFixed(2)}%
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 p-6 hover:from-indigo-700 hover:to-purple-700 transition-all text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Performance</p>
            <p className="text-white text-3xl font-bold">{analytics.total_clicks > 0 ? "Active" : "New"}</p>
          </Card>
        </div>

        {dailyStats.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">Traffic Overview</h3>
                <p className="text-slate-400 text-sm">Daily clicks and impressions trend</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Impressions</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                  }}
                  labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {detailedAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {detailedAnalytics.hourlyStats.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold text-lg mb-1">Hourly Traffic</h3>
                <p className="text-slate-400 text-sm mb-4">Traffic distribution by hour</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={detailedAnalytics.hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                      itemStyle={{ color: "#e2e8f0" }}
                      cursor={{ fill: "#334155" }}
                    />
                    <Bar dataKey="clicks" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {detailedAnalytics.deviceStats.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold text-lg mb-1">Device Distribution</h3>
                <p className="text-slate-400 text-sm mb-4">Traffic by device type</p>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={detailedAnalytics.deviceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {detailedAnalytics.deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  {detailedAnalytics.deviceStats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></div>
                      <span className="text-sm text-slate-300">
                        {stat.name}: {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {detailedAnalytics.browserStats.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold text-lg mb-1">Top Browsers</h3>
                <p className="text-slate-400 text-sm mb-4">Most used browsers</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={detailedAnalytics.browserStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                      itemStyle={{ color: "#e2e8f0" }}
                      cursor={{ fill: "#334155" }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {detailedAnalytics.osStats.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold text-lg mb-1">Operating Systems</h3>
                <p className="text-slate-400 text-sm mb-4">OS distribution</p>
                <div className="space-y-3">
                  {detailedAnalytics.osStats.map((os, idx) => {
                    const total = detailedAnalytics.osStats.reduce((sum, item) => sum + item.value, 0)
                    const percentage = (os.value / total) * 100

                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-300">{os.name}</span>
                          <span className="text-sm font-semibold text-white">{os.value}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {detailedAnalytics?.locationStats && detailedAnalytics.locationStats.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-white font-bold text-lg mb-1">Geographic Distribution</h3>
            <p className="text-slate-400 text-sm mb-4">Top locations by clicks</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Rank</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Country</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">City</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">Clicks</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedAnalytics.locationStats.map((location, idx) => {
                    const totalClicks = detailedAnalytics.locationStats.reduce((sum, l) => sum + l.clicks, 0)
                    const percentage = ((location.clicks / totalClicks) * 100).toFixed(1)

                    return (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{location.country}</td>
                        <td className="py-3 px-4 text-slate-300">{location.city}</td>
                        <td className="py-3 px-4 text-right text-white font-semibold">{location.clicks}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md text-sm font-medium">
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
