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
  Activity,
  Server,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Super Admin</h1>
              <p className="text-xs text-slate-400">System Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-sm font-semibold">{user?.email}</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
          <p className="text-slate-400">Complete analytics and monitoring for Shortner Pro</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Users</p>
            <p className="text-white text-3xl font-bold">{stats?.totalUsers.toLocaleString() || 0}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Links</p>
            <p className="text-white text-3xl font-bold">{stats?.totalLinks.toLocaleString() || 0}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
            <p className="text-white text-3xl font-bold">{stats?.totalClicks.toLocaleString() || 0}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Earnings</p>
            <p className="text-white text-3xl font-bold">${stats?.totalEarnings.toFixed(2) || "0.00"}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Impressions</p>
            <p className="text-white text-3xl font-bold">{stats?.totalImpressions.toLocaleString() || 0}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 border-rose-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-rose-400" />
              </div>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Firebase Projects</p>
            <p className="text-white text-3xl font-bold">{stats?.firebaseCredentials || 0}</p>
          </Card>

          <Card
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 p-6 animate-scale-in"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-cyan-400" />
              </div>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">API Tokens</p>
            <p className="text-white text-3xl font-bold">{stats?.apiTokens || 0}</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <h3 className="text-xl font-bold text-white mb-4">User Growth (30 Days)</h3>
            <ChartContainer
              config={{
                count: {
                  label: "New Users",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Top Links by Clicks */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 animate-slide-up" style={{ animationDelay: "0.9s" }}>
            <h3 className="text-xl font-bold text-white mb-4">Top Links by Clicks</h3>
            <ChartContainer
              config={{
                clicks: {
                  label: "Clicks",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLinks.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="short_code" type="category" stroke="#94a3b8" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_clicks" fill="hsl(var(--chart-2))" animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8 animate-slide-up" style={{ animationDelay: "1s" }}>
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">ID</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-700">
                    <TableCell className="text-slate-300">{user.id}</TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell className="text-slate-300">{user.name || "-"}</TableCell>
                    <TableCell className="text-slate-300">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Firebase Credentials Table */}
        <Card className="bg-slate-800/50 border-slate-700 animate-slide-up" style={{ animationDelay: "1.1s" }}>
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white">Firebase Credentials Registered</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Project ID</TableHead>
                  <TableHead className="text-slate-300">Client Email</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firebaseCredentials.map((cred) => (
                  <TableRow key={cred.id} className="border-slate-700">
                    <TableCell className="text-slate-300 font-mono text-sm">{cred.projectId}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{cred.clientEmail}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          cred.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {cred.verified ? "Verified" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {cred.createdAt?.toDate ? new Date(cred.createdAt.toDate()).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
