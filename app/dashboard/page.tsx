"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Copy,
  Trash2,
  TrendingUp,
  Eye,
  Plus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Key,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import DashboardNav from "@/components/dashboard-nav"
import { Toaster } from "@/components/ui/toaster"

interface UserLink {
  id: number
  short_code: string
  original_url: string
  title?: string
  created_at: string
  total_clicks: number
  total_impressions: number
  expiry_date?: string
}

interface User {
  id: number
  email: string
  name?: string
  image?: string
}

type SortField = "created_at" | "total_clicks" | "total_impressions"
type SortOrder = "asc" | "desc"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<UserLink[]>([])
  const [filteredLinks, setFilteredLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedLinks, setSelectedLinks] = useState<number[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchUserLinks(parsedUser.id)
    fetchNotificationCount(parsedUser.id)
  }, [router])

  const fetchUserLinks = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/links?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch links")
      const data = await response.json()
      setLinks(data.links || [])
      setFilteredLinks(data.links || [])
    } catch (error) {
      console.error("[v0] Error fetching links:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationCount = async (userId: number) => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          "x-user-id": userId.toString(),
          "x-user-email": user?.email || "",
        },
      })
      if (response.ok) {
        const data = await response.json()
        const unreadCount = data.notifications.filter((n: any) => !n.is_read).length
        setUnreadNotifications(unreadCount)
      }
    } catch (error) {
      console.error("[v0] Error fetching notification count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleCopyLink = (shortCode: string, id: number) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    try {
      const response = await fetch(`/api/user/links/${linkId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete link")
      setLinks(links.filter((l) => l.id !== linkId))
      setSelectedLinks(selectedLinks.filter((id) => id !== linkId))
    } catch (error) {
      console.error("[v0] Error deleting link:", error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedLinks.length} links?`)) return

    try {
      await Promise.all(selectedLinks.map((id) => fetch(`/api/user/links/${id}`, { method: "DELETE" })))
      setLinks(links.filter((l) => !selectedLinks.includes(l.id)))
      setSelectedLinks([])
    } catch (error) {
      console.error("[v0] Error deleting links:", error)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const toggleSelectAll = () => {
    if (selectedLinks.length === paginatedLinks.length && paginatedLinks.length > 0) {
      setSelectedLinks([])
    } else {
      setSelectedLinks(paginatedLinks.map((l) => l.id))
    }
  }

  const toggleSelectLink = (id: number) => {
    if (selectedLinks.includes(id)) {
      setSelectedLinks(selectedLinks.filter((linkId) => linkId !== id))
    } else {
      setSelectedLinks([...selectedLinks, id])
    }
  }

  const totalStats = {
    clicks: links.reduce((sum, l) => sum + l.total_clicks, 0),
    impressions: links.reduce((sum, l) => sum + l.total_impressions, 0),
  }

  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage)
  const paginatedLinks = filteredLinks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getExpiryStatus = (expiryDate: string | undefined) => {
    if (!expiryDate) return null

    const now = new Date()
    const expiry = new Date(expiryDate)
    const daysSinceExpiry = Math.floor((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceExpiry >= 0 && daysSinceExpiry < 7) {
      // Link is expired and will be deleted within 7 days
      return {
        daysLeft: 7 - daysSinceExpiry,
        message: `This link expired on ${expiry.toLocaleDateString()} and will be permanently deleted in ${7 - daysSinceExpiry} day(s).`,
        color: "text-red-400",
      }
    } else if (daysSinceExpiry < 0 && daysSinceExpiry > -3) {
      // Link expires soon (within 3 days)
      const daysUntilExpiry = Math.abs(daysSinceExpiry)
      return {
        daysLeft: daysUntilExpiry,
        message: `This link will expire in ${daysUntilExpiry} day(s) and will be deleted 7 days after expiry.`,
        color: "text-yellow-400",
      }
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Toaster />

      <DashboardNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Links</h2>
            <p className="text-slate-400">Manage and track your shortened links</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/api-tokens">
              <Button variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                <Key className="w-4 h-4 mr-2" />
                API Tokens
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Link
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
                <p className="text-white text-3xl font-bold">{totalStats.clicks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Ad Impressions</p>
                <p className="text-white text-3xl font-bold">{totalStats.impressions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Data Table */}
        {links.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No links yet</h3>
            <p className="text-slate-400 mb-6">Create your first shortened link to get started</p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Create Your First Link</Button>
            </Link>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by short code or URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedLinks.length > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedLinks.length})
                    </Button>
                  )}
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-[100px] bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 rows</SelectItem>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLinks.length === paginatedLinks.length && paginatedLinks.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-slate-600"
                      />
                    </TableHead>
                    <TableHead className="text-slate-300">URL</TableHead>
                    <TableHead
                      className="text-slate-300 cursor-pointer select-none text-right"
                      onClick={() => handleSort("total_clicks")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Clicks
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-slate-300 cursor-pointer select-none text-right hidden md:table-cell"
                      onClick={() => handleSort("total_impressions")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Imprs.
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-slate-300 cursor-pointer select-none"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLinks.map((link) => {
                    const expiryStatus = getExpiryStatus(link.expiry_date)

                    return (
                      <TableRow key={link.id} className="border-slate-700 hover:bg-slate-800/30">
                        <TableCell>
                          <Checkbox
                            checked={selectedLinks.includes(link.id)}
                            onCheckedChange={() => toggleSelectLink(link.id)}
                            className="border-slate-600"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <code className="text-indigo-400 font-mono text-sm bg-slate-900 px-2 py-1 rounded">
                                {link.short_code}
                              </code>
                              <button
                                onClick={() => handleCopyLink(link.short_code, link.id)}
                                className={`p-1 rounded transition ${
                                  copiedId === link.id
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "text-slate-400 hover:text-slate-300"
                                }`}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/analytics/${link.short_code}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white h-8 w-8 p-0"
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs truncate">{link.original_url}</span>
                              <a
                                href={link.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-300 flex-shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm text-right font-semibold">
                          {link.total_clicks.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm text-right hidden md:table-cell">
                          {link.total_impressions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm hidden md:table-cell">
                          {new Date(link.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span>{link.expiry_date ? new Date(link.expiry_date).toLocaleDateString() : "Never"}</span>
                            {expiryStatus && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className={`w-4 h-4 ${expiryStatus.color} cursor-help`} />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border border-slate-700 text-white max-w-xs">
                                    <p>{expiryStatus.message}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLinks.length)} of {filteredLinks.length} links
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-slate-900 border-slate-600 text-slate-300 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm text-slate-300">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-slate-900 border-slate-600 text-slate-300 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
