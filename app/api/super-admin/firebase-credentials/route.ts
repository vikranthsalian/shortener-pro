import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { isSuperAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = authHeader.replace("Bearer ", "")
    const isAdmin = await isSuperAdmin(userEmail)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!db) {
      return NextResponse.json({
        success: true,
        credentials: [],
      })
    }

    const snapshot = await db.collection("firebase_credentials").get()
    const credentials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      privateKey: "***REDACTED***", // Don't expose private keys
    }))

    return NextResponse.json({
      success: true,
      credentials,
    })
  } catch (error) {
    console.error("[v0] Error fetching Firebase credentials:", error)
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
  }
}
