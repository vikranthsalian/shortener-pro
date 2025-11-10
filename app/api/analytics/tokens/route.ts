import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const firebaseAppId = request.nextUrl.searchParams.get("firebaseAppId")

    if (!userId && !firebaseAppId) {
      return NextResponse.json({ error: "User ID or Firebase App ID is required" }, { status: 400 })
    }

    // Fetch tokens from Firestore
    const tokensRef = db.collection("api_tokens")
    let query = tokensRef as any

    if (userId) {
      query = query.where("userId", "==", Number.parseInt(userId))
    }
    if (firebaseAppId) {
      query = query.where("firebaseAppId", "==", firebaseAppId)
    }

    const snapshot = await query.get()
    const tokens = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Calculate analytics
    const totalTokens = tokens.length
    const totalUsage = tokens.reduce((sum: number, token: any) => sum + (token.usageCount || 0), 0)
    const activeTokens = tokens.filter((token: any) => token.status === "active").length
    const revokedTokens = tokens.filter((token: any) => token.status === "revoked").length

    // Usage over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split("T")[0],
        usage: 0,
      }
    })

    tokens.forEach((token: any) => {
      if (token.lastUsed) {
        const usedDate = new Date(token.lastUsed).toISOString().split("T")[0]
        const dayData = last7Days.find((d) => d.date === usedDate)
        if (dayData) {
          dayData.usage += 1
        }
      }
    })

    // Token creation trend (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split("T")[0],
        created: 0,
      }
    })

    tokens.forEach((token: any) => {
      if (token.createdAt) {
        const createdDate = new Date(token.createdAt).toISOString().split("T")[0]
        const dayData = last30Days.find((d) => d.date === createdDate)
        if (dayData) {
          dayData.created += 1
        }
      }
    })

    // Top tokens by usage
    const topTokens = tokens
      .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map((token: any) => ({
        name: token.name,
        usage: token.usageCount || 0,
      }))

    return NextResponse.json({
      summary: {
        totalTokens,
        totalUsage,
        activeTokens,
        revokedTokens,
      },
      usageOverTime: last7Days,
      creationTrend: last30Days,
      topTokens,
    })
  } catch (error) {
    console.error("[v0] Error fetching token analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
