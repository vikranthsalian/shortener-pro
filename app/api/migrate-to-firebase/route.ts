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

    const admin = await import("firebase-admin")

    // Initialize a temporary Firebase app for this user's database
    const appName = `migration-${userId}-${Date.now()}`
    const userApp = admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey.replace(/\\n/g, "\n"),
        }),
      },
      appName,
    )

    const userDb = userApp.firestore()

    console.log("[v0] Firebase Admin SDK initialized")

    // Migrate user data
    await userDb
      .collection("users")
      .doc(userId.toString())
      .set({
        userId: user.id,
        email: user.email,
        name: user.name || "",
        createdAt: user.created_at,
        provider: user.provider || "email",
        migratedAt: new Date().toISOString(),
      })

    console.log("[v0] User data migrated")

    // Migrate URLs
    let migratedUrls = 0
    for (const url of urls) {
      await userDb
        .collection("urls")
        .doc(url.id.toString())
        .set({
          urlId: url.id,
          userId: userId,
          shortCode: url.short_code,
          originalUrl: url.original_url,
          title: url.title || "",
          description: url.description || "",
          createdAt: url.created_at,
          updatedAt: url.updated_at,
          isActive: url.is_active,
          totalClicks: url.total_clicks,
          totalImpressions: url.total_impressions,
          estimatedEarnings: url.estimated_earnings,
          expiryDate: url.expiry_date || null,
        })
      migratedUrls++
    }

    console.log("[v0] URLs migrated:", migratedUrls)

    // Migrate analytics
    let migratedAnalytics = 0
    for (const analytic of analytics) {
      await userDb
        .collection("analytics")
        .doc(analytic.id.toString())
        .set({
          analyticsId: analytic.id,
          urlId: analytic.url_id,
          date: analytic.date,
          totalClicks: analytic.total_clicks || 0,
          totalImpressions: analytic.total_impressions || 0,
          estimatedEarnings: analytic.estimated_earnings?.toString() || "0",
        })
      migratedAnalytics++
    }

    console.log("[v0] Analytics migrated:", migratedAnalytics)

    // Clean up the temporary Firebase app
    await userApp.delete()

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
