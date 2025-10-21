import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params

    const urlResult = await sql`SELECT id, original_url, created_at FROM urls WHERE short_code = ${shortCode}`

    if (urlResult.length === 0) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    const url = urlResult[0]

    const clicksResult = await sql`SELECT COUNT(*) as count FROM clicks WHERE url_id = ${url.id}`

    const impressionsResult = await sql`SELECT COUNT(*) as count FROM impressions WHERE url_id = ${url.id}`

    const totalImpressions = Number.parseInt(impressionsResult[0].count)
    const cpmRate = 0.5 // $0.50 per 1000 impressions
    const estimatedEarnings = (totalImpressions / 1000) * cpmRate

    const recentClicks = await sql`
      SELECT clicked_at, device_type, country FROM clicks 
      WHERE url_id = ${url.id}
      ORDER BY clicked_at DESC 
      LIMIT 10
    `

    const dailyStats = await sql`
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks,
        (SELECT COUNT(*) FROM impressions WHERE url_id = ${url.id} AND DATE(impressed_at) = DATE(clicks.clicked_at)) as impressions
      FROM clicks 
      WHERE url_id = ${url.id} AND clicked_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      shortCode,
      originalUrl: url.original_url,
      createdAt: url.created_at,
      totalClicks: Number.parseInt(clicksResult[0].count),
      totalImpressions,
      estimatedEarnings: estimatedEarnings.toFixed(2),
      recentClicks,
      dailyStats,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
