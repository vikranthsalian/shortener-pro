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
        COALESCE(COUNT(DISTINCT c.id), 0) as total_clicks,
        COALESCE(COUNT(DISTINCT i.id), 0) as total_impressions,
        COALESCE(SUM(CAST(a.estimated_earnings AS DECIMAL)), 0) as estimated_earnings
      FROM urls u
      LEFT JOIN clicks c ON u.id = c.url_id
      LEFT JOIN impressions i ON u.id = i.url_id
      LEFT JOIN analytics a ON u.id = a.url_id
      WHERE u.user_id = ${userId}
      GROUP BY u.id, u.short_code, u.original_url, u.title, u.created_at
      ORDER BY u.created_at DESC
    `

    return Response.json({ links: result })
  } catch (error) {
    console.error("[v0] Error fetching user links:", error)
    return Response.json({ error: "Failed to fetch links" }, { status: 500 })
  }
}
