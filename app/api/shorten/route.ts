import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateShortCode, isValidUrl } from "@/lib/short-code-generator"
import { runMigration } from "@/lib/migrate"
import { rateLimit } from "@/lib/rate-limit"
import { syncLinkToUserFirebase, hasFirebaseCredentials } from "@/lib/firebase-sync"

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

    const hasFirebase = userId ? await hasFirebaseCredentials(userId) : false

    let url: any

    if (hasFirebase) {
      console.log("[v0] User has Firebase configured, saving directly to Firebase")

      const linkData = {
        id: Date.now(), // Use timestamp as temporary ID
        userId: userId,
        shortCode: shortCode,
        originalUrl: originalUrl,
        title: title || null,
        description: description || null,
        createdAt: new Date().toISOString(),
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
      }

      const syncResult = await syncLinkToUserFirebase(linkData)

      if (syncResult.synced) {
        console.log("[v0] Link successfully saved to user's Firebase")
        url = linkData
      } else {
        console.log("[v0] Failed to save to Firebase, falling back to Neon")
        // Fallback to Neon if Firebase fails
        const result = await sql`
          INSERT INTO urls (short_code, original_url, title, description, user_id, expiry_date) 
          VALUES (${shortCode}, ${originalUrl}, ${title || null}, ${description || null}, ${userId || null}, ${
            expiryDate ? expiryDate.toISOString() : null
          })
          RETURNING id, short_code, original_url, title, description, user_id, created_at, expiry_date
        `
        url = result[0]
      }
    } else {
      console.log("[v0] User has no Firebase configured, saving to Neon")
      const result = await sql`
        INSERT INTO urls (short_code, original_url, title, description, user_id, expiry_date) 
        VALUES (${shortCode}, ${originalUrl}, ${title || null}, ${description || null}, ${userId || null}, ${
          expiryDate ? expiryDate.toISOString() : null
        })
        RETURNING id, short_code, original_url, title, description, user_id, created_at, expiry_date
      `
      url = result[0]
    }

    return NextResponse.json({
      id: url.id,
      shortCode: url.short_code || url.shortCode,
      originalUrl: url.original_url || url.originalUrl,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://shortner-pro.vercel.app"}/s/${url.short_code || url.shortCode}`,
      createdAt: url.created_at || url.createdAt,
      expiryDate: url.expiry_date || url.expiryDate,
    })
  } catch (error) {
    console.error("Error creating short URL:", error)
    return NextResponse.json({ error: "Failed to create short URL" }, { status: 500 })
  }
}
