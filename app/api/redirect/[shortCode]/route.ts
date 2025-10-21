import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params

    const result = await sql`SELECT id, original_url FROM urls WHERE short_code = ${shortCode} AND is_active = true`

    if (result.length === 0) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    const url = result[0]

    // Record click asynchronously (don't wait for it)
    recordClick(url.id, request).catch(console.error)

    // Return the original URL so frontend can redirect with ad
    return NextResponse.json({
      originalUrl: url.original_url,
      shortCode,
    })
  } catch (error) {
    console.error("Error fetching URL:", error)
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
  }
}

async function recordClick(urlId: number, request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await sql`
      INSERT INTO clicks (url_id, user_agent, referrer, ip_address) 
      VALUES (${urlId}, ${userAgent}, ${referrer}, ${ip})
    `
  } catch (error) {
    console.error("Error recording click:", error)
  }
}
