"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function SetupSuperAdminPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [passwordMessage, setPasswordMessage] = useState("")

  const handleSetupSuperAdmin = async () => {
    setSetupStatus("loading")
    setSetupMessage("")

    try {
      const response = await fetch("/api/setup-super-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setSetupStatus("success")
        setSetupMessage(`Super admin created: ${data.user.email} (ID: ${data.user.id})`)
      } else {
        setSetupStatus("error")
        setSetupMessage(data.message || "Failed to setup super admin")
      }
    } catch (error: any) {
      setSetupStatus("error")
      setSetupMessage(error.message || "An error occurred")
    }
  }

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setPasswordMessage("Passwords do not match")
      setPasswordStatus("error")
      return
    }

    if (password.length < 8) {
      setPasswordMessage("Password must be at least 8 characters")
      setPasswordStatus("error")
      return
    }

    setPasswordStatus("loading")
    setPasswordMessage("")

    try {
      const response = await fetch("/api/super-admin/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "super@admin.com",
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordStatus("success")
        setPasswordMessage("Password set successfully! You can now login.")
        setPassword("")
        setConfirmPassword("")
      } else {
        setPasswordStatus("error")
        setPasswordMessage(data.message || "Failed to set password")
      }
    } catch (error: any) {
      setPasswordStatus("error")
      setPasswordMessage(error.message || "An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Super Admin Setup</h1>
          <p className="text-slate-300">Initialize super admin user for the system</p>
        </div>

        {/* Step 1: Create Super Admin User */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create Super Admin User</CardTitle>
            <CardDescription>Create the super@admin.com user with super admin privileges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSetupSuperAdmin} disabled={setupStatus === "loading"} className="w-full">
              {setupStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {setupStatus === "loading" ? "Setting up..." : "Create Super Admin User"}
            </Button>

            {setupStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">{setupMessage}</AlertDescription>
              </Alert>
            )}

            {setupStatus === "error" && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">{setupMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Set Password */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Set Super Admin Password</CardTitle>
            <CardDescription>Set a secure password for super@admin.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <Button
              onClick={handleSetPassword}
              disabled={passwordStatus === "loading" || !password || !confirmPassword}
              className="w-full"
            >
              {passwordStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {passwordStatus === "loading" ? "Setting Password..." : "Set Password"}
            </Button>

            {passwordStatus === "success" && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">{passwordMessage}</AlertDescription>
              </Alert>
            )}

            {passwordStatus === "error" && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">{passwordMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">
              <strong>Note:</strong> After setup is complete, you can login at{" "}
              <a href="/login" className="text-purple-400 hover:underline">
                /login
              </a>{" "}
              with email: <code className="bg-slate-900 px-2 py-1 rounded">super@admin.com</code> and your password.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
