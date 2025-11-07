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
  Plus,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
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
import { Textarea } from "@/components/ui/textarea"

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

export default function APITokensPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<APIToken[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<APIToken | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<{ [key: string]: boolean }>({})
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [firebaseProjectId, setFirebaseProjectId] = useState("")
  const [firebaseClientEmail, setFirebaseClientEmail] = useState("")
  const [firebasePrivateKey, setFirebasePrivateKey] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchTokens(parsedUser.id)
  }, [router])

  const fetchTokens = async (userId: number) => {
    try {
      console.log("[v0] Fetching tokens for user:", userId)
      const response = await fetch(`/api/tokens?userId=${userId}`)

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        let errorData
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json()
        } else {
          const text = await response.text()
          errorData = { error: text }
        }
        console.error("[v0] Error response:", errorData)
        throw new Error(errorData.error || errorData.details || "Failed to fetch tokens")
      }

      const data = await response.json()
      console.log("[v0] Fetched tokens:", data.tokens)
      setTokens(data.tokens || [])
    } catch (error) {
      console.error("[v0] Error fetching tokens:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch tokens"
      alert(`Error: ${errorMessage}. Check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async () => {
    if (!newTokenName.trim() || !user) return

    setCreating(true)
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          tokenName: newTokenName,
        }),
      })

      if (!response.ok) throw new Error("Failed to create token")

      const data = await response.json()
      setNewlyCreatedToken(data.token)
      setTokens([data.token, ...tokens])
      setNewTokenName("")
      setShowDialog(false)
      // Show the newly created token
      setVisibleTokens({ [data.token.id]: true })
    } catch (error) {
      console.error("[v0] Error creating token:", error)
      alert("Failed to create API token")
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeToken = async (token: string) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/tokens/${token}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to revoke token")
      setTokens(tokens.filter((t) => t.id !== token))
    } catch (error) {
      console.error("[v0] Error revoking token:", error)
      alert("Failed to revoke token")
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

  const handleVerifyFirebase = async () => {
    if (!firebaseProjectId.trim() || !firebaseClientEmail.trim() || !firebasePrivateKey.trim()) {
      setVerificationResult({
        success: false,
        message: "Please fill in all Firebase credentials",
      })
      return
    }

    setVerifying(true)
    setVerificationResult(null)

    try {
      const response = await fetch("/api/firebase-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerificationResult({
          success: true,
          message: "Firebase connection verified successfully! Your website can access this database.",
        })
      } else {
        setVerificationResult({
          success: false,
          message: data.error || "Failed to connect to Firebase. Please check your credentials.",
        })
      }
    } catch (error) {
      console.error("[v0] Error verifying Firebase:", error)
      setVerificationResult({
        success: false,
        message: "An error occurred while verifying Firebase connection.",
      })
    } finally {
      setVerifying(false)
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
            <h1 className="text-white font-bold text-xl hidden sm:block">API Tokens</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Dashboard
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">API Tokens</h2>
            <p className="text-slate-400">Manage your API keys for programmatic access</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Token
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New API Token</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Generate a new API token for programmatic access to Shortner Pro APIs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="tokenName" className="text-slate-300">
                    Token Name
                  </Label>
                  <Input
                    id="tokenName"
                    placeholder="e.g., Production Server, Mobile App"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white mt-2"
                  />
                </div>
                <Button
                  onClick={handleCreateToken}
                  disabled={!newTokenName.trim() || creating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Token"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* New Token Alert */}
        {newlyCreatedToken && (
          <Alert className="mb-6 bg-emerald-900/20 border-emerald-700">
            <AlertCircle className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-300">
              Token created successfully! Make sure to copy it now - you won't be able to see it again.
            </AlertDescription>
          </Alert>
        )}

        {/* Firebase Connection Verification Card */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg mb-2">Firebase Connection Verification</h3>
            <p className="text-slate-400 text-sm">
              Enter your Firebase credentials to verify if this website can access your Firestore database.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="firebaseProjectId" className="text-slate-300">
                Firebase Project ID
              </Label>
              <Input
                id="firebaseProjectId"
                placeholder="your-project-id"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="firebaseClientEmail" className="text-slate-300">
                Firebase Client Email
              </Label>
              <Input
                id="firebaseClientEmail"
                placeholder="firebase-adminsdk@your-project.iam.gserviceaccount.com"
                value={firebaseClientEmail}
                onChange={(e) => setFirebaseClientEmail(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="firebasePrivateKey" className="text-slate-300">
                Firebase Private Key
              </Label>
              <Textarea
                id="firebasePrivateKey"
                placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                value={firebasePrivateKey}
                onChange={(e) => setFirebasePrivateKey(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-2 min-h-[120px] font-mono text-sm"
              />
              <p className="text-slate-500 text-xs mt-1">
                Paste the entire private key including the BEGIN and END markers
              </p>
            </div>

            {verificationResult && (
              <Alert
                className={
                  verificationResult.success ? "bg-emerald-900/20 border-emerald-700" : "bg-red-900/20 border-red-700"
                }
              >
                {verificationResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={verificationResult.success ? "text-emerald-300" : "text-red-300"}>
                  {verificationResult.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleVerifyFirebase}
              disabled={verifying}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Connection...
                </>
              ) : (
                "Verify Firebase Connection"
              )}
            </Button>
          </div>
        </Card>

        {/* API Documentation Link */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Using Your API Tokens</h3>
              <p className="text-slate-400 text-sm mb-4">
                Include your API token in the{" "}
                <code className="bg-slate-900 px-2 py-1 rounded text-indigo-400">Authorization</code> header of your
                requests as a Bearer token.
              </p>
              <div className="bg-slate-900 p-4 rounded-lg mb-4">
                <code className="text-sm text-slate-300">
                  <span className="text-indigo-400">Authorization:</span> Bearer sp_your_token_here
                </code>
              </div>
              <Link href="/api-docs">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                  View API Documentation
                </Button>
              </Link>
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
            <Button onClick={() => setShowDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              Create Your First Token
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <Card key={token.id} className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Key className="w-5 h-5 text-indigo-400" />
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
