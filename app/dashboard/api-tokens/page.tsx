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
  Plus,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardNav from "@/components/dashboard-nav"

interface APIToken {
  id: number
  name: string
  token: string
  is_active: boolean
  rate_limit: number
  usage_count: number
  created_at: string
  last_used_at: string | null
}

interface User {
  id: number
  email: string
}

export default function APITokensPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<APIToken[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")
  const [newTokenRateLimit, setNewTokenRateLimit] = useState("1000")
  const [copiedTokenId, setCopiedTokenId] = useState<number | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Set<number>>(new Set())
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTokens, setFilteredTokens] = useState<APIToken[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchTokens()
  }, [router])

  const fetchTokens = async () => {
    try {
      const userData = localStorage.getItem("user")
      if (!userData) return

      const user = JSON.parse(userData)

      const response = await fetch("/api/tokens", {
        headers: {
          "x-user-id": user.id.toString(),
          "x-user-email": user.email,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch tokens")

      const data = await response.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error("[v0] Error fetching tokens:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      alert("Please enter a token name")
      return
    }

    setCreating(true)

    try {
      const userData = localStorage.getItem("user")
      if (!userData) return

      const user = JSON.parse(userData)

      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id.toString(),
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          name: newTokenName,
          rateLimit: Number.parseInt(newTokenRateLimit),
        }),
      })
      console.error("[v0] Error creating token:", response)
      if (!response.ok) throw new Error("Failed to create token")

      const data = await response.json()
      setTokens([data.token, ...tokens])
      setNewlyCreatedToken(data.token.token)
      setNewTokenName("")
      setNewTokenRateLimit("1000")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error creating token:", error)
      alert("Failed to create token")
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeToken = async (tokenId: number) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone.")) {
      return
    }

    try {
      const userData = localStorage.getItem("user")
      if (!userData) return

      const user = JSON.parse(userData)

      const response = await fetch(`/api/tokens/${tokenId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id.toString(),
        },
      })

      if (!response.ok) throw new Error("Failed to revoke token")

      setTokens(tokens.map((t) => (t.id === tokenId ? { ...t, is_active: false } : t)))
    } catch (error) {
      console.error("[v0] Error revoking token:", error)
      alert("Failed to revoke token")
    }
  }

  const handleCopyToken = (token: string, tokenId: number) => {
    navigator.clipboard.writeText(token)
    setCopiedTokenId(tokenId)
    setTimeout(() => setCopiedTokenId(null), 2000)
  }

  const toggleTokenVisibility = (tokenId: number) => {
    const newVisible = new Set(visibleTokens)
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId)
    } else {
      newVisible.add(tokenId)
    }
    setVisibleTokens(newVisible)
  }

  const maskToken = (token: string) => {
    const prefix = token.substring(0, 10)
    return `${prefix}${"•".repeat(50)}`
  }

  useEffect(() => {
    let filtered = [...tokens]

    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.token.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTokens(filtered)
    setCurrentPage(1)
  }, [searchQuery, tokens])

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
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">API Tokens</h2>
            <p className="text-slate-400">Manage your API access tokens for programmatic link creation</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New API Token</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new API token to access the Shortner Pro API programmatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="token-name" className="text-slate-300">
                    Token Name
                  </Label>
                  <Input
                    id="token-name"
                    placeholder="My Application Token"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="rate-limit" className="text-slate-300">
                    Rate Limit (requests per hour)
                  </Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={newTokenRateLimit}
                    onChange={(e) => setNewTokenRateLimit(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateToken} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Token"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Newly Created Token Alert */}
        {newlyCreatedToken && (
          <Alert className="mb-6 bg-emerald-900/20 border-emerald-700 text-emerald-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Token created successfully! Make sure to copy it now.</p>
              <p className="text-xs mb-2">You won't be able to see this token again.</p>
              <div className="bg-slate-900 rounded p-3 flex items-center justify-between gap-2">
                <code className="text-sm text-emerald-300 break-all">{newlyCreatedToken}</code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedToken)
                    setTimeout(() => setNewlyCreatedToken(null), 2000)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* API Documentation Card */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">How to Use Your API Token</h3>
              <p className="text-slate-400 text-sm mb-4">
                Include your API token in the Authorization header of your requests:
              </p>
              <div className="bg-slate-900 rounded-lg p-4">
                <code className="text-emerald-400 text-sm">
                  curl -X POST {process.env.NEXT_PUBLIC_BASE_URL}/api/shorten \<br />
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_TOKEN_HERE" \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-d '{"{"}"originalUrl": "https://example.com"{"}"}'
                </code>
              </div>
            </div>
          </div>
        </Card>

        {/* Tokens List */}
        {tokens.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No API tokens yet</h3>
            <p className="text-slate-400 mb-6">Create your first API token to start using the Shortner Pro API</p>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by token name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
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

            <div className="space-y-4 p-4">
              {paginatedTokens.map((token) => (
                <Card key={token.id} className="bg-slate-900/50 border-slate-600 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{token.name}</h3>
                        {!token.is_active && (
                          <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-md">Revoked</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-slate-400 font-mono bg-slate-900 px-3 py-2 rounded flex-1 min-w-0 break-all">
                            {visibleTokens.has(token.id) ? token.token : maskToken(token.token)}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTokenVisibility(token.id)}
                            className="text-slate-400 hover:text-white flex-shrink-0"
                          >
                            {visibleTokens.has(token.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyToken(token.token, token.id)}
                            className={`flex-shrink-0 ${
                              copiedTokenId === token.id ? "text-emerald-400" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                          <span>Usage: {token.usage_count.toLocaleString()} requests</span>
                          <span>Rate Limit: {token.rate_limit}/hour</span>
                          <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                          {token.last_used_at && (
                            <span>Last Used: {new Date(token.last_used_at).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {token.is_active && (
                      <Button
                        onClick={() => handleRevokeToken(token.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 lg:ml-4"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

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
