import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"

export async function POST(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params

    const urlResult = await sql`SELECT id FROM urls WHERE short_code = ${shortCode}`

    if (urlResult.length === 0) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    const urlId = urlResult[0].id
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await sql`
      INSERT INTO impressions (url_id, ad_type, user_agent, ip_address) 
      VALUES (${urlId}, 'adsense', ${userAgent}, ${ip})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording impression:", error)
    return NextResponse.json({ error: "Failed to record impression" }, { status: 500 })
  }
}
