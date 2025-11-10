"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Loader2, TrendingUp, Key, Activity, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"

interface Analytics {
  summary: {
    totalTokens: number
    totalUsage: number
    activeTokens: number
    revokedTokens: number
  }
  usageOverTime: Array<{ date: string; usage: number }>
  creationTrend: Array<{ date: string; created: number }>
  topTokens: Array<{ name: string; usage: number }>
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

export default function TokenAnalytics() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUserId(parsedUser.id)
    fetchAnalytics(parsedUser.id)
  }, [router])

  const fetchAnalytics = async (userId: number) => {
    try {
      const response = await fetch(`/api/analytics/tokens?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
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
          <p className="text-slate-300">Failed to load analytics</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/api-tokens">
            <Button variant="ghost" className="text-slate-300 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to API Tokens
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">API Token Analytics</h1>
          <p className="text-slate-400">Track your API token usage and performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Tokens</p>
                <p className="text-white text-3xl font-bold animate-fade-in">{analytics.summary.totalTokens}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Usage</p>
                <p className="text-white text-3xl font-bold animate-fade-in">{analytics.summary.totalUsage}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Active Tokens</p>
                <p className="text-white text-3xl font-bold animate-fade-in">{analytics.summary.activeTokens}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Revoked Tokens</p>
                <p className="text-white text-3xl font-bold animate-fade-in">{analytics.summary.revokedTokens}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Over Time Chart */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Usage Over Time (Last 7 Days)</h3>
            <ChartContainer
              config={{
                usage: {
                  label: "API Calls",
                  color: "hsl(217, 91%, 60%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.usageOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="var(--color-usage)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-usage)", r: 4 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Token Creation Trend */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Token Creation Trend (Last 30 Days)</h3>
            <ChartContainer
              config={{
                created: {
                  label: "Tokens Created",
                  color: "hsl(142, 71%, 45%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.creationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>

        {/* Top Tokens Chart */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Top Tokens by Usage</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer
              config={{
                usage: {
                  label: "API Calls",
                  color: "hsl(217, 91%, 60%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.topTokens}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="usage"
                    animationDuration={1000}
                  >
                    {analytics.topTokens.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-3">
              {analytics.topTokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-300 font-medium">{token.name}</span>
                  </div>
                  <span className="text-white font-bold">{token.usage} calls</span>
                </div>
              ))}
              {analytics.topTokens.length === 0 && (
                <p className="text-slate-400 text-center py-8">No token usage data available yet</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
