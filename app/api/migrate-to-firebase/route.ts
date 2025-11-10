import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, firebaseProjectId, firebaseClientEmail, firebasePrivateKey } = body

    if (!userId || !firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Starting migration for user:", userId)

    // Fetch user data from Neon
    const [userResult, urlsResult, analyticsResult] = await Promise.all([
      sql`SELECT * FROM users WHERE id = ${userId}`,
      sql`
        SELECT 
          u.id,
          u.short_code,
          u.original_url,
          u.title,
          u.description,
          u.created_at,
          u.updated_at,
          u.is_active,
          u.expiry_date,
          COALESCE((SELECT COUNT(*) FROM clicks WHERE url_id = u.id), 0) as total_clicks,
          COALESCE((SELECT COUNT(*) FROM impressions WHERE url_id = u.id), 0) as total_impressions
        FROM urls u
        WHERE u.user_id = ${userId}
        ORDER BY u.created_at DESC
      `,
      sql`SELECT * FROM analytics WHERE url_id IN (SELECT id FROM urls WHERE user_id = ${userId})`,
    ])

    const user = userResult[0]
    const urls = urlsResult.map((url: any) => ({
      ...url,
      total_clicks: Number(url.total_clicks),
      total_impressions: Number(url.total_impressions),
      estimated_earnings: ((Number(url.total_impressions) / 1000) * 0.5).toFixed(2),
    }))
    const analytics = analyticsResult

    console.log("[v0] Fetched data - URLs:", urls.length, "Analytics:", analytics.length)

    // Migrate to Firebase using REST API
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`

    // Create access token using service account credentials
    const { GoogleAuth } = await import("google-auth-library")
    const auth = new GoogleAuth({
      credentials: {
        client_email: firebaseClientEmail,
        private_key: firebasePrivateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/datastore"],
    })

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    if (!accessToken.token) {
      throw new Error("Failed to get Firebase access token")
    }

    console.log("[v0] Firebase access token obtained")

    // Migrate user data
    const userDoc = {
      fields: {
        userId: { integerValue: user.id.toString() },
        email: { stringValue: user.email },
        name: { stringValue: user.name || "" },
        createdAt: { timestampValue: user.created_at },
        provider: { stringValue: user.provider || "email" },
        migratedAt: { timestampValue: new Date().toISOString() },
      },
    }

    await fetch(`${firebaseUrl}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDoc),
    })

    console.log("[v0] User data migrated")

    // Migrate URLs
    let migratedUrls = 0
    for (const url of urls) {
      const urlDoc = {
        fields: {
          urlId: { integerValue: url.id.toString() },
          userId: { integerValue: userId.toString() },
          shortCode: { stringValue: url.short_code },
          originalUrl: { stringValue: url.original_url },
          title: { stringValue: url.title || "" },
          description: { stringValue: url.description || "" },
          createdAt: { timestampValue: url.created_at },
          updatedAt: { timestampValue: url.updated_at },
          isActive: { booleanValue: url.is_active },
          totalClicks: { integerValue: url.total_clicks.toString() },
          totalImpressions: { integerValue: url.total_impressions.toString() },
          estimatedEarnings: { stringValue: url.estimated_earnings },
          expiryDate: url.expiry_date ? { timestampValue: url.expiry_date } : { nullValue: null },
        },
      }

      await fetch(`${firebaseUrl}/urls/${url.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(urlDoc),
      })
      migratedUrls++
    }

    console.log("[v0] URLs migrated:", migratedUrls)

    // Migrate analytics
    let migratedAnalytics = 0
    for (const analytic of analytics) {
      const analyticDoc = {
        fields: {
          analyticsId: { integerValue: analytic.id.toString() },
          urlId: { integerValue: analytic.url_id.toString() },
          date: { stringValue: analytic.date },
          totalClicks: { integerValue: analytic.total_clicks?.toString() || "0" },
          totalImpressions: { integerValue: analytic.total_impressions?.toString() || "0" },
          estimatedEarnings: { stringValue: analytic.estimated_earnings?.toString() || "0" },
        },
      }

      await fetch(`${firebaseUrl}/analytics/${analytic.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analyticDoc),
      })
      migratedAnalytics++
    }

    console.log("[v0] Analytics migrated:", migratedAnalytics)

    return NextResponse.json({
      success: true,
      message: "Data migrated successfully to Firebase",
      stats: {
        urls: migratedUrls,
        analytics: migratedAnalytics,
      },
    })
  } catch (error) {
    console.error("[v0] Migration error:", error)
    return NextResponse.json(
      {
        error: "Failed to migrate data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
