import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
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
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const [totalUsers, totalLinks, totalClicks, totalImpressions, totalEarnings, recentUsers, topLinks, userGrowth] =
      await Promise.all([
        sql`SELECT COUNT(*) as count FROM users`,
        sql`SELECT COUNT(*) as count FROM urls`,
        sql`SELECT SUM(total_clicks) as total FROM analytics`,
        sql`SELECT SUM(total_impressions) as total FROM analytics`,
        sql`SELECT SUM(estimated_earnings) as total FROM analytics`,
        sql`
        SELECT id, email, name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `,
        sql`
        SELECT u.short_code, u.original_url, u.title, 
               COALESCE(SUM(a.total_clicks), 0) as total_clicks,
               COALESCE(SUM(a.total_impressions), 0) as total_impressions,
               COALESCE(SUM(a.estimated_earnings), 0) as total_earnings
        FROM urls u
        LEFT JOIN analytics a ON u.id = a.url_id
        GROUP BY u.id, u.short_code, u.original_url, u.title
        ORDER BY total_clicks DESC
        LIMIT 10
      `,
        sql`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      ])

    let firebaseCredsCount = 0
    let firebaseTokensCount = 0

    try {
      if (db) {
        const credsSnapshot = await db.collection("firebase_credentials").get()
        firebaseCredsCount = credsSnapshot.size

        const tokensSnapshot = await db.collection("api_tokens").get()
        firebaseTokensCount = tokensSnapshot.size
      }
    } catch (error) {
      console.log("[v0] Firebase not available for super admin stats")
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers[0]?.count || 0),
        totalLinks: Number(totalLinks[0]?.count || 0),
        totalClicks: Number(totalClicks[0]?.total || 0),
        totalImpressions: Number(totalImpressions[0]?.total || 0),
        totalEarnings: Number(totalEarnings[0]?.total || 0),
        firebaseCredentials: firebaseCredsCount,
        apiTokens: firebaseTokensCount,
      },
      recentUsers: recentUsers,
      topLinks: topLinks,
      userGrowth: userGrowth,
    })
  } catch (error) {
    console.error("[v0] Error fetching super admin analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
