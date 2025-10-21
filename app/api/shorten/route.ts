import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateShortCode, isValidUrl } from "@/lib/short-code-generator"
import { runMigration } from "@/lib/migrate"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const url="";
  try {
    await runMigration()

    const { originalUrl, title, description, userId } = await request.json()

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

    const result = await sql`
      INSERT INTO urls (short_code, original_url, title, description, user_id) 
      VALUES (${shortCode}, ${originalUrl}, ${title || null}, ${description || null}, ${userId || null})
      RETURNING id, short_code, original_url, created_at
    `
   

     url = result[0]
      //if(url==""){
          return NextResponse.json({ error: "Failed to create short URL 1" ,data :result }, { status: 500 })
     // }

    console.error("creating short URL:", url)
    return NextResponse.json({
      id: url.id,
      shortCode: url.short_code,
      originalUrl: url.original_url,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://v0-url-shortener-architecture.vercel.app"}/s/${url.short_code}`,
      createdAt: url.created_at,
    })
  } catch (error) {
    console.error("Error creating short URL:", error)
    return NextResponse.json({ error: "Failed to create short URL 2" ,data :url }, { status: 500 })
  }
}
