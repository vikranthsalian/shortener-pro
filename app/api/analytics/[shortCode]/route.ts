import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const urlResult =
      await sql`SELECT id, original_url, title, created_at, user_id FROM urls WHERE short_code = ${shortCode}`

    if (urlResult.length === 0) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    const url = urlResult[0]

    if (userId && url.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const clicksResult = await sql`SELECT COUNT(*) as count FROM clicks WHERE url_id = ${url.id}`
    const totalClicks = Number(clicksResult[0].count)

    const impressionsResult = await sql`SELECT COUNT(*) as count FROM impressions WHERE url_id = ${url.id}`
    const totalImpressions = Number(impressionsResult[0].count)

    const cpmRate = 0.5 // $0.50 per 1000 impressions
    const estimatedEarnings = (totalImpressions / 1000) * cpmRate
    const ctr = totalClicks > 0 ? (totalImpressions / totalClicks) * 100 : 0

    const dailyStats = await sql`
      SELECT 
        DATE(c.clicked_at) as date,
        COUNT(DISTINCT c.id) as clicks,
        COALESCE(COUNT(DISTINCT i.id), 0) as impressions,
        COALESCE(ROUND((COUNT(DISTINCT i.id)::DECIMAL / NULLIF(COUNT(DISTINCT c.id), 0)) * 100, 2), 0) as ctr,
        COALESCE(ROUND((COUNT(DISTINCT i.id)::DECIMAL / 1000) * ${cpmRate}, 2), 0) as earnings
      FROM clicks c
      LEFT JOIN impressions i ON i.url_id = c.url_id AND DATE(i.impressed_at) = DATE(c.clicked_at)
      WHERE c.url_id = ${url.id} AND c.clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(c.clicked_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      analytics: {
        id: url.id,
        short_code: shortCode,
        original_url: url.original_url,
        title: url.title,
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        total_earnings: estimatedEarnings.toFixed(2),
        ctr: ctr,
      },
      dailyStats: dailyStats.map((stat: any) => ({
        date: stat.date,
        clicks: Number(stat.clicks),
        impressions: Number(stat.impressions),
        earnings: Number(stat.earnings),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
