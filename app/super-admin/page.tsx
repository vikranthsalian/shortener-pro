"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Loader2,
  Users,
  LinkIcon,
  TrendingUp,
  Eye,
  DollarSign,
  Database,
  Key,
  LogOut,
  Shield,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface SuperAdminStats {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  totalImpressions: number
  totalEarnings: number
  firebaseCredentials: number
  apiTokens: number
}

interface RecentUser {
  id: number
  email: string
  name?: string
  created_at: string
}

interface TopLink {
  short_code: string
  original_url: string
  title?: string
  total_clicks: number
  total_impressions: number
  total_earnings: number
}

interface UserGrowth {
  date: string
  count: number
}

interface FirebaseCredential {
  id: string
  projectId: string
  clientEmail: string
  verified: boolean
  createdAt: any
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [topLinks, setTopLinks] = useState<TopLink[]>([])
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([])
  const [firebaseCredentials, setFirebaseCredentials] = useState<FirebaseCredential[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)

    if (!parsedUser.is_super_admin) {
      alert("Access denied. Super admin only.")
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    fetchSuperAdminData(parsedUser.email)
  }, [router])

  const fetchSuperAdminData = async (email: string) => {
    try {
      const [analyticsRes, firebaseRes] = await Promise.all([
        fetch("/api/super-admin/analytics", {
          headers: { Authorization: `Bearer ${email}` },
        }),
        fetch("/api/super-admin/firebase-credentials", {
          headers: { Authorization: `Bearer ${email}` },
        }),
      ])

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setStats(data.stats)
        setRecentUsers(data.recentUsers)
        setTopLinks(data.topLinks)
        setUserGrowth(data.userGrowth)
      }

      if (firebaseRes.ok) {
        const data = await firebaseRes.json()
        setFirebaseCredentials(data.credentials)
      }
    } catch (error) {
      console.error("[v0] Error fetching super admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  const trends = {
    users: calculateTrend(stats?.totalUsers || 0, (stats?.totalUsers || 0) * 0.9),
    links: calculateTrend(stats?.totalLinks || 0, (stats?.totalLinks || 0) * 0.85),
    clicks: calculateTrend(stats?.totalClicks || 0, (stats?.totalClicks || 0) * 0.95),
    earnings: calculateTrend(stats?.totalEarnings || 0, (stats?.totalEarnings || 0) * 0.88),
  }

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-50">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 flex flex-col items-center gap-4">
            <button className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <Database className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <Key className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* Main Content */}
        <main className="ml-20 flex-1">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Welcome back, Super Admin</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Last 30 days
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <ArrowUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">{trends.users.value.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats?.totalUsers.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-slate-500">Total Users Registered</div>
              </Card>

              <Card
                className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <ArrowUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">{trends.clicks.value.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats?.totalClicks.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-slate-500">Total Clicks</div>
              </Card>

              <Card
                className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <ArrowUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">5.2%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats?.totalImpressions.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-slate-500">Total Impressions</div>
              </Card>

              <Card
                className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <ArrowUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">{trends.earnings.value.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">${(stats?.totalEarnings || 0).toFixed(2)}</div>
                <div className="text-sm text-slate-500">Total Earnings</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Large Area Chart */}
              <Card className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Platform Performance</h3>
                    <p className="text-sm text-slate-500 mt-1">User growth and engagement trends</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">This Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                      <span className="text-sm text-slate-600">Last Period</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500 mb-1">Avg. Selling Price</div>
                    <div className="text-2xl font-bold text-slate-900">$1231.10</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold">12.5%</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500 mb-1">Avg. Clicks</div>
                    <div className="text-2xl font-bold text-slate-900">19/123</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold">8.2%</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500 mb-1">Avg. Impressions</div>
                    <div className="text-2xl font-bold text-slate-900">120,365</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <ArrowDown className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-xs text-red-600 font-semibold">3.1%</span>
                    </div>
                  </div>
                </div>

                <ChartContainer
                  config={{
                    count: {
                      label: "Users",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Item 04</div>
                      <div className="text-lg font-bold text-slate-900">199.04</div>
                      <div className="text-xs text-emerald-600">+18.51%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Item 04</div>
                      <div className="text-lg font-bold text-slate-900">259.04</div>
                      <div className="text-xs text-red-600">-4.33%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Item 04</div>
                      <div className="text-lg font-bold text-slate-900">299.04</div>
                      <div className="text-xs text-emerald-600">+8.51%</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Side Stats Cards */}
              <div className="space-y-6">
                {/* Firebase & API Stats */}
                <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Data Company Progress</h3>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-slate-600">Chart 1</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">45%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                          <span className="text-sm text-slate-600">Chart 2</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">29%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-600 rounded-full" style={{ width: "29%" }}></div>
                      </div>
                    </div>
                  </div>

                  <ChartContainer
                    config={{
                      value: {
                        label: "Value",
                        color: "#3b82f6",
                      },
                    }}
                    className="h-[120px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Jan", value: 40 },
                          { name: "Feb", value: 60 },
                          { name: "Mar", value: 45 },
                          { name: "Apr", value: 80 },
                          { name: "May", value: 50 },
                          { name: "Jun", value: 70 },
                        ]}
                      >
                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </Card>

                {/* Donut Chart */}
                <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Distribution</h3>
                  </div>

                  <div className="relative">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Value",
                          color: "#3b82f6",
                        },
                      }}
                      className="h-[180px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Active", value: 65 },
                              { name: "Inactive", value: 35 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            animationDuration={1500}
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#e2e8f0" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-slate-900">65K+</div>
                      <div className="text-sm text-slate-500">$136K</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-xs text-slate-500">Short Links</div>
                      <div className="text-sm font-bold text-slate-900">{stats?.totalLinks || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-xs text-slate-500">Firebase</div>
                      <div className="text-sm font-bold text-slate-900">{stats?.firebaseCredentials || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Key className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-xs text-slate-500">API Tokens</div>
                      <div className="text-sm font-bold text-slate-900">{stats?.apiTokens || 0}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart Report */}
              <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Data Company Report</h3>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span className="text-sm text-slate-600">2023</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded"></div>
                    <span className="text-sm text-slate-600">Employees</span>
                  </div>
                </div>

                <ChartContainer
                  config={{
                    current: {
                      label: "2023",
                      color: "#3b82f6",
                    },
                    previous: {
                      label: "Employees",
                      color: "#e2e8f0",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Jan", current: 40, previous: 35 },
                        { name: "Feb", current: 30, previous: 28 },
                        { name: "Mar", current: 50, previous: 45 },
                        { name: "Apr", current: 90, previous: 85 },
                        { name: "May", current: 45, previous: 40 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="previous" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="current" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              {/* Area Chart */}
              <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Data Directory</h3>
                </div>

                <ChartContainer
                  config={{
                    value: {
                      label: "Value",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={topLinks.slice(0, 6).map((link, index) => ({
                        name: `W${index + 1}`,
                        value: link.total_clicks,
                      }))}
                    >
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#blueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              {/* Spending List */}
              <Card className="bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Company Spending</h3>
                  <Button variant="ghost" size="sm">
                    See More
                  </Button>
                </div>

                <div className="space-y-4">
                  {topLinks.slice(0, 3).map((link, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${index === 0 ? "bg-blue-100" : index === 1 ? "bg-cyan-100" : "bg-purple-100"} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <LinkIcon
                          className={`w-5 h-5 ${index === 0 ? "text-blue-600" : index === 1 ? "text-cyan-600" : "text-purple-600"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {link.title || link.short_code}
                        </div>
                        <div className="text-xs text-slate-500">{link.total_clicks.toLocaleString()} clicks</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-slate-900">${link.total_earnings.toFixed(2)}</div>
                        <div className="text-xs text-emerald-600">
                          +{((link.total_clicks / (stats?.totalClicks || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
