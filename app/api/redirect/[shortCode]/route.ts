import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"
import { parseUserAgent, getLocationFromIP } from "@/lib/device-detection"

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

    console.log("[v0] Recording click - userAgent:", userAgent)
    console.log("[v0] Recording click - ip:", ip)

    const deviceInfo = parseUserAgent(userAgent)
    const locationInfo = await getLocationFromIP(ip)

    console.log("[v0] Device info:", deviceInfo)
    console.log("[v0] Location info:", locationInfo)

    await sql`
      INSERT INTO clicks (
        url_id, 
        user_agent, 
        referrer, 
        ip_address,
        country,
        city,
        device_type,
        device_brand,
        os_name,
        os_version,
        browser_name,
        browser_version
      ) 
      VALUES (
        ${urlId}, 
        ${userAgent}, 
        ${referrer}, 
        ${ip},
        ${locationInfo.country || "unknown"},
        ${locationInfo.city || "unknown"},
        ${deviceInfo.deviceType || "unknown"},
        ${deviceInfo.deviceBrand || "unknown"},
        ${deviceInfo.osName || "unknown"},
        ${deviceInfo.osVersion || "unknown"},
        ${deviceInfo.browserName || "unknown"},
        ${deviceInfo.browserVersion || "unknown"}
      )
    `
    console.log("[v0] Click recorded successfully")
  } catch (error) {
    console.error("[v0] Error recording click:", error)
  }
}
