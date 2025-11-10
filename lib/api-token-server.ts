// Server-only functions that use Node.js crypto
import { randomBytes } from "crypto"
import { sql } from "./db"
import type { APIToken } from "./api-token"

export function generateToken(): string {
  const randomPart = randomBytes(32).toString("hex")
  return `sp_${randomPart}`
}

export async function createAPIToken(
  userId: number,
  userEmail: string,
  name: string,
  rateLimit = 1000,
): Promise<APIToken> {
  console.log("[v0] createAPIToken called with:", {
    userId,
    userEmail,
    name,
    rateLimit,
  })

  try {
    const token = generateToken()
    console.log("[v0] Generated token:", token.substring(0, 15) + "...")

    console.log("[v0] Executing SQL INSERT query...")
    const result = await sql`
      INSERT INTO api_tokens (user_id, name, token, rate_limit)
      VALUES (${userId}, ${name}, ${token}, ${rateLimit})
      RETURNING *
    `

    console.log("[v0] SQL query successful, result:", result)

    if (!result || result.length === 0) {
      throw new Error("No data returned from INSERT query")
    }

    return result[0] as APIToken
  } catch (error) {
    console.error("[v0] Error in createAPIToken:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}
