import { runMigration } from "@/lib/migrate"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    await runMigration()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        u.id,
        u.short_code,
        u.original_url,
        u.title,
        u.created_at,
        COALESCE((SELECT COUNT(*) FROM clicks WHERE url_id = u.id), 0) as total_clicks,
        COALESCE((SELECT COUNT(*) FROM impressions WHERE url_id = u.id), 0) as total_impressions
      FROM urls u
      WHERE u.user_id = ${userId}
      ORDER BY u.created_at DESC
    `

    const links = result.map((link: any) => ({
      ...link,
      total_clicks: Number(link.total_clicks),
      total_impressions: Number(link.total_impressions),
      estimated_earnings: ((Number(link.total_impressions) / 1000) * 0.5).toFixed(2),
    }))

    return Response.json({ links })
  } catch (error) {
    console.error("[v0] Error fetching user links:", error)
    return Response.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
