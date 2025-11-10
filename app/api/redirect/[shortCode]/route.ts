import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { runMigration } from "@/lib/migrate"
import { parseUserAgent, getLocationFromIP } from "@/lib/device-detection"
import { getLinkFromFirebase, recordClickInFirebase } from "@/lib/firebase-sync"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    await runMigration()

    const { shortCode } = params

    const ownerResult = await sql`
      SELECT user_id FROM urls WHERE short_code = ${shortCode} LIMIT 1
    `

    let userId = ownerResult.length > 0 ? ownerResult[0].user_id : null
    let url: any = null
    let fromFirebase = false

    if (userId) {
      console.log("[v0] Checking Firebase for link:", shortCode, "userId:", userId)
      const firebaseLink = await getLinkFromFirebase(userId, shortCode)

      if (firebaseLink) {
        console.log("[v0] Link found in Firebase")
        url = firebaseLink
        fromFirebase = true
      }
    }

    if (!url) {
      console.log("[v0] Checking Neon for link:", shortCode)
      const result = await sql`
        SELECT id, original_url, expiry_date, user_id
        FROM urls 
        WHERE short_code = ${shortCode} AND is_active = true
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
      }

      url = result[0]
      userId = url.user_id
    }

    // Check expiry
    if (url.expiry_date && new Date(url.expiry_date || url.expiryDate) < new Date()) {
      if (!fromFirebase) {
        await sql`UPDATE urls SET is_active = false WHERE id = ${url.id}`
      }
      return NextResponse.json({ error: "This link has expired" }, { status: 410 })
    }

    if (fromFirebase && userId) {
      recordClickFirebase(userId, shortCode, request).catch(console.error)
    } else {
      recordClick(url.id, request).catch(console.error)
    }

    return NextResponse.json({
      originalUrl: url.original_url || url.originalUrl,
      shortCode,
    })
  } catch (error) {
    console.error("Error fetching URL:", error)
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
  }
}

async function recordClickFirebase(userId: string, shortCode: string, request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    const deviceInfo = parseUserAgent(userAgent)
    const locationInfo = await getLocationFromIP(ip)

    await recordClickInFirebase(userId, shortCode, {
      userAgent,
      referrer,
      ipAddress: ip,
      country: locationInfo.country || "unknown",
      city: locationInfo.city || "unknown",
      deviceType: deviceInfo.deviceType || "unknown",
      deviceBrand: deviceInfo.deviceBrand || "unknown",
      osName: deviceInfo.osName || "unknown",
      osVersion: deviceInfo.osVersion || "unknown",
      browserName: deviceInfo.browserName || "unknown",
      browserVersion: deviceInfo.browserVersion || "unknown",
    })

    console.log("[v0] Click recorded in Firebase")
  } catch (error) {
    console.error("[v0] Error recording click in Firebase:", error)
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
