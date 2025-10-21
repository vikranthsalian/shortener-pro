import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"
import { getHourlyStats, getDeviceStats, getBrowserStats, getOSStats, getLocationStats } from "@/lib/analytics-utils"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const urlResult = await sql`SELECT id, user_id FROM urls WHERE short_code = ${shortCode}`

    if (urlResult.length === 0) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    const url = urlResult[0]

    if (userId && url.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const [hourlyStats, deviceStats, browserStats, osStats, locationStats] = await Promise.all([
      getHourlyStats(url.id),
      getDeviceStats(url.id),
      getBrowserStats(url.id),
      getOSStats(url.id),
      getLocationStats(url.id),
    ])

    return NextResponse.json({
      hourlyStats,
      deviceStats,
      browserStats,
      osStats,
      locationStats,
    })
  } catch (error) {
    console.error("[v0] Error fetching detailed analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
