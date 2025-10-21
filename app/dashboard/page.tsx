"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, TrendingUp, Eye, DollarSign } from "lucide-react"

interface Analytics {
  shortCode: string
  originalUrl: string
  createdAt: string
  totalClicks: number
  totalImpressions: number
  estimatedEarnings: string
  recentClicks: Array<{
    clicked_at: string
    device_type: string
    country: string
  }>
  dailyStats: Array<{
    date: string
    clicks: number
    impressions: number
  }>
}

export default function Dashboard() {
  const [shortCode, setShortCode] = useState("")
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchAnalytics = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/analytics/${shortCode}`)
      if (!response.ok) {
        setError("Short code not found")
        setLoading(false)
        return
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Analytics Dashboard</h1>
          <Button variant="ghost" className="text-slate-300 hover:text-white">
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Form */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <form onSubmit={handleFetchAnalytics} className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter short code (e.g., abc123)"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <Button type="submit" disabled={loading || !shortCode} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </Card>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8">{error}</div>
        )}

        {analytics && (
          <div className="space-y-8">
            {/* URL Info */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Link Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Short Code</p>
                  <p className="text-white font-mono">{analytics.shortCode}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Original URL</p>
                  <p className="text-blue-300 break-all text-sm">{analytics.originalUrl}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Created</p>
                  <p className="text-white">{new Date(analytics.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
                    <p className="text-white text-3xl font-bold">{analytics.totalClicks}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Ad Impressions</p>
                    <p className="text-white text-3xl font-bold">{analytics.totalImpressions}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Est. Earnings</p>
                    <p className="text-white text-3xl font-bold">${analytics.estimatedEarnings}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">CTR</p>
                    <p className="text-white text-3xl font-bold">
                      {analytics.totalImpressions > 0
                        ? ((analytics.totalClicks / analytics.totalImpressions) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Last 7 Days</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Date</th>
                      <th className="text-left py-3 px-4 text-slate-400">Clicks</th>
                      <th className="text-left py-3 px-4 text-slate-400">Impressions</th>
                      <th className="text-left py-3 px-4 text-slate-400">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailyStats.map((stat, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-white">{new Date(stat.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-300">{stat.clicks}</td>
                        <td className="py-3 px-4 text-slate-300">{stat.impressions}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {stat.impressions > 0 ? ((stat.clicks / stat.impressions) * 100).toFixed(1) : "0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Clicks */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Recent Clicks</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Time</th>
                      <th className="text-left py-3 px-4 text-slate-400">Device</th>
                      <th className="text-left py-3 px-4 text-slate-400">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentClicks.map((click, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-white">{new Date(click.clicked_at).toLocaleTimeString()}</td>
                        <td className="py-3 px-4 text-slate-300">{click.device_type || "Unknown"}</td>
                        <td className="py-3 px-4 text-slate-300">{click.country || "Unknown"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {!analytics && !error && (
          <div className="text-center py-12">
            <p className="text-slate-400">Enter a short code to view analytics</p>
          </div>
        )}
      </div>
    </div>
  )
}
