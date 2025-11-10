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

  const loadFirebaseDetails = async (userId: number) => {
    try {
      const response = await fetch(`/api/firebase-credentials?userId=${userId}`)
      const data = await response.json()

      if (data.success && data.hasCredentials) {
        setSavedFirebaseConfig({
          projectId: data.credentials.projectId,
          clientEmail: data.credentials.clientEmail,
          createdAt: data.credentials.createdAt,
          verified: data.credentials.verified,
        })
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
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        setFirebaseTokens([data.token, ...firebaseTokens])
        setVisibleTokens({ [data.token.id]: true })
        setNewTokenName("")
        setShowCreateDialog(false)
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
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg mb-4">Tokens in Your Firebase</h3>
            {firebaseTokens.map((token) => (
              <Card key={token.id} className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Key className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-semibold text-lg">{token.name}</h3>
                      {token.isActive ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Revoked</span>
                      )}
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg mb-3 flex items-center gap-2">
                      <code className="text-sm text-slate-300 flex-1 break-all">{maskToken(token.token)}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTokenVisibility(token.id)}
                        className="text-slate-400 hover:text-white flex-shrink-0"
                      >
                        {visibleTokens[token.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToken(token.token)}
                        className={`flex-shrink-0 ${
                          copiedToken === token.token
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="text-slate-300">{new Date(token.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Used</p>
                        <p className="text-slate-300">
                          {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Usage Count</p>
                        <p className="text-slate-300">{token.usageCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Rate Limit</p>
                        <p className="text-slate-300">{token.rateLimit} req/min</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeToken(token.id)}
                      disabled={!token.isActive}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
