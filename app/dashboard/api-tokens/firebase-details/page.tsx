"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Copy,
  Trash2,
  Key,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Database,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"

interface APIToken {
  id: string
  userId: number
  userEmail: string
  token: string
  name: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
  usageCount: number
  rateLimit: number
}

interface User {
  id: number
  email: string
  name?: string
  image?: string
}

type SortField = "name" | "createdAt" | "lastUsedAt" | "usageCount"
type SortOrder = "asc" | "desc"

export default function FirebaseDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [savedFirebaseConfig, setSavedFirebaseConfig] = useState<{
    projectId: string
    clientEmail: string
    createdAt: string
    verified: boolean
  } | null>(null)
  const [firebaseTokens, setFirebaseTokens] = useState<APIToken[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")
  const [creating, setCreating] = useState(false)
  const [visibleTokens, setVisibleTokens] = useState<{ [key: string]: boolean }>({})
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [filteredTokens, setFilteredTokens] = useState<APIToken[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadFirebaseDetails(parsedUser.id)
  }, [router])

  useEffect(() => {
    let filtered = [...firebaseTokens]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.token.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "createdAt" || sortField === "lastUsedAt") {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTokens(filtered)
    setCurrentPage(1)
  }, [searchQuery, sortField, sortOrder, firebaseTokens])

  const loadFirebaseDetails = async (userId: number) => {
    try {
      const [credentialsResponse, tokensResponse] = await Promise.all([
        fetch(`/api/firebase-credentials?userId=${userId}`),
        fetch(`/api/tokens?userId=${userId}`),
      ])

      const credentialsData = await credentialsResponse.json()
      const tokensData = await tokensResponse.json()

      if (credentialsData.success && credentialsData.hasCredentials) {
        setSavedFirebaseConfig({
          projectId: credentialsData.credentials.projectId,
          clientEmail: credentialsData.credentials.clientEmail,
          createdAt: credentialsData.credentials.createdAt,
          verified: credentialsData.credentials.verified,
        })

        if (tokensData.tokens) {
          console.log("[v0] Loaded tokens:", tokensData.tokens)
          setFirebaseTokens(tokensData.tokens)
        }
      } else {
        // No Firebase credentials found, redirect back
        router.push("/dashboard/api-tokens")
      }
    } catch (error) {
      console.error("[v0] Error loading Firebase details:", error)
      alert("Failed to load Firebase details")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async () => {
    if (!newTokenName.trim() || !user || !savedFirebaseConfig) return

    setCreating(true)
    try {
      const response = await fetch("https://shortner-pro.vercel.app/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firebaseAppId: savedFirebaseConfig.projectId,
          tokenName: newTokenName,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        setFirebaseTokens([data.token, ...firebaseTokens])
        setVisibleTokens({ [data.token.id]: true })
        setNewTokenName("")
        setShowCreateDialog(false)

        await loadFirebaseDetails(user.id)

        alert("Token created successfully in your Firebase database!")
      } else {
        alert(data.error || "Failed to create token")
      }
    } catch (error) {
      console.error("[v0] Error creating token:", error)
      alert("An error occurred while creating token")
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const toggleTokenVisibility = (tokenId: string) => {
    setVisibleTokens((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }))
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const maskToken = (token: string) => {
    if (visibleTokens[token]) return token
    return `${token.substring(0, 10)}${"•".repeat(30)}${token.substring(token.length - 10)}`
  }

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/tokens/${tokenId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to revoke token")
      setFirebaseTokens(firebaseTokens.filter((t) => t.id !== tokenId))
    } catch (error) {
      console.error("[v0] Error revoking token:", error)
      alert("Failed to revoke token")
    }
  }

  const handleBulkRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke ${selectedTokens.length} tokens? This action cannot be undone.`))
      return

    try {
      await Promise.all(selectedTokens.map((id) => fetch(`/api/tokens/${id}`, { method: "DELETE" })))
      setFirebaseTokens(firebaseTokens.filter((t) => !selectedTokens.includes(t.id)))
      setSelectedTokens([])
    } catch (error) {
      console.error("[v0] Error revoking tokens:", error)
      alert("Failed to revoke some tokens")
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
    if (selectedTokens.length === paginatedTokens.length) {
      setSelectedTokens([])
    } else {
      setSelectedTokens(paginatedTokens.map((t) => t.id))
    }
  }

  const toggleSelectToken = (id: string) => {
    if (selectedTokens.includes(id)) {
      setSelectedTokens(selectedTokens.filter((tokenId) => tokenId !== id))
    } else {
      setSelectedTokens([...selectedTokens, id])
    }
  }

  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage)
  const paginatedTokens = filteredTokens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
            </Link>
            <h1 className="text-white font-bold text-xl hidden sm:block">Firebase Details</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/api-tokens">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                API Tokens
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-slate-300">
              {user?.image && (
                <img
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm">{user?.name || user?.email}</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-slate-800 p-4 space-y-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-slate-300">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/api-tokens">
              <Button variant="ghost" className="w-full text-slate-300">
                API Tokens
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-slate-300 mb-3">
              {user?.image && (
                <img
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard/api-tokens">
          <Button variant="ghost" className="text-slate-300 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to API Tokens
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Firebase Configuration</h2>
            <p className="text-slate-400">Manage your Firebase database connection and tokens</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                <Key className="w-4 h-4 mr-2" />
                Create New Token
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Token in Your Firebase</DialogTitle>
                <DialogDescription className="text-slate-400">
                  This token will be stored directly in your Firebase database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="tokenName" className="text-slate-300">
                    Token Name
                  </Label>
                  <Input
                    id="tokenName"
                    placeholder="e.g., Production API, Mobile App Token"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white mt-2"
                  />
                </div>
                <Button
                  onClick={handleCreateToken}
                  disabled={!newTokenName.trim() || creating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating in Firebase...
                    </>
                  ) : (
                    "Create Token"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Firebase Configuration Details */}
        {savedFirebaseConfig && (
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Connected Firebase Database
              </h3>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 text-sm mb-2 font-medium">Project ID</p>
                  <p className="text-slate-200 font-mono text-sm bg-slate-900 px-4 py-3 rounded-lg border border-slate-700">
                    {savedFirebaseConfig.projectId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2 font-medium">Client Email</p>
                  <p className="text-slate-200 font-mono text-sm bg-slate-900 px-4 py-3 rounded-lg border border-slate-700 break-all">
                    {savedFirebaseConfig.clientEmail}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2 font-medium">Status</p>
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Verified & Active</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2 font-medium">Connected Since</p>
                  <p className="text-slate-200 bg-slate-900 px-4 py-3 rounded-lg border border-slate-700">
                    {new Date(savedFirebaseConfig.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Alert className="mt-6 bg-emerald-900/20 border-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-emerald-300">
                  All tokens created on this page will be stored directly in your Firebase Firestore database.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        )}

        {/* Tokens List */}
        {firebaseTokens.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Firebase Tokens Yet</h3>
            <p className="text-slate-400 mb-6">Create your first token to be stored in your Firebase database</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Key className="w-4 h-4 mr-2" />
              Create Your First Token
            </Button>
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
                      placeholder="Search by name or token..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedTokens.length > 0 && (
                    <Button
                      onClick={handleBulkRevoke}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke ({selectedTokens.length})
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
                        checked={selectedTokens.length === paginatedTokens.length && paginatedTokens.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-slate-600"
                      />
                    </TableHead>
                    <TableHead className="text-slate-300 cursor-pointer select-none" onClick={() => handleSort("name")}>
                      <div className="flex items-center gap-1">
                        Token Name
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300 hidden lg:table-cell">Token Value</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead
                      className="text-slate-300 cursor-pointer select-none hidden md:table-cell"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-slate-300 cursor-pointer select-none text-right hidden md:table-cell"
                      onClick={() => handleSort("usageCount")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Usage
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTokens.map((token) => (
                    <TableRow key={token.id} className="border-slate-700 hover:bg-slate-800/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedTokens.includes(token.id)}
                          onCheckedChange={() => toggleSelectToken(token.id)}
                          className="border-slate-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium">{token.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 max-w-md">
                          <code className="text-sm text-slate-300 flex-1 break-all font-mono bg-slate-900 px-2 py-1 rounded">
                            {maskToken(token.token)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTokenVisibility(token.id)}
                            className="text-slate-400 hover:text-white h-8 w-8 p-0 flex-shrink-0"
                          >
                            {visibleTokens[token.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToken(token.token)}
                            className={`h-8 w-8 p-0 flex-shrink-0 ${
                              copiedToken === token.token
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {token.isActive ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Revoked</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm hidden md:table-cell">
                        {new Date(token.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm text-right font-semibold hidden md:table-cell">
                        {token.usageCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeToken(token.id)}
                          disabled={!token.isActive}
                          className="text-red-400 hover:text-red-300 h-8 w-8 p-0 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredTokens.length)} of {filteredTokens.length} tokens
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
