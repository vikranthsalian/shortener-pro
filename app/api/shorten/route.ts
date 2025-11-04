import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateShortCode, isValidUrl } from "@/lib/short-code-generator"
import { runMigration } from "@/lib/migrate"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    await runMigration()

    const { originalUrl, title, description, userId, expiry } = await request.json()

    if (userId) {
      const rateLimitResult = await rateLimit(`shorten:${userId}`, 10, 60000)
      if (rateLimitResult.isLimited) {
        return NextResponse.json({ error: "Rate limit exceeded. Maximum 10 links per minute." }, { status: 429 })
      }
    }

    // Validate input
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 })
    }

    // Generate unique short code
    let shortCode = generateShortCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await sql`SELECT id FROM urls WHERE short_code = ${shortCode}`
      if (existing.length === 0) break
      shortCode = generateShortCode()
      attempts++
    }

    if (attempts === 10) {
      return NextResponse.json({ error: "Failed to generate unique short code" }, { status: 500 })
    }

    let expiryDate = null
    if (expiry === "7days") {
      expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } else if (expiry === "1month") {
      expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
    // "never" means expiryDate stays null

    const result = await sql`
      INSERT INTO urls (short_code, original_url, title, description, user_id, expiry_date) 
      VALUES (${shortCode}, ${originalUrl}, ${title || null}, ${description || null}, ${userId || null}, ${expiryDate ? expiryDate.toISOString() : null})
      RETURNING id, short_code, original_url, created_at, expiry_date
    `

    const url = result[0]

    return NextResponse.json({
      id: url.id,
      shortCode: url.short_code,
      originalUrl: url.original_url,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://v0-url-shortener-architecture.vercel.app"}/s/${url.short_code}`,
      createdAt: url.created_at,
      expiryDate: url.expiry_date,
    })
  } catch (error) {
    console.error("Error creating short URL:", error)
    return NextResponse.json({ error: "Failed to create short URL" }, { status: 500 })
  }
}
