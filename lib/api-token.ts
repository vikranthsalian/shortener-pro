import { sql } from "./db"
import { randomBytes } from "crypto"

export interface APIToken {
  id: number
  user_id: number
  user_email: string
  name: string
  token: string
  is_active: boolean
  rate_limit: number
  usage_count: number
  created_at: Date
  last_used_at: Date | null
  revoked_at: Date | null
}

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
      INSERT INTO api_tokens (user_id, user_email, name, token, rate_limit)
      VALUES (${userId}, ${userEmail}, ${name}, ${token}, ${rateLimit})
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

export async function validateToken(token: string): Promise<APIToken | null> {
  const result = await sql`
    SELECT * FROM api_tokens
    WHERE token = ${token} AND is_active = true AND revoked_at IS NULL
  `

  if (result.length === 0) {
    return null
  }

  await sql`
    UPDATE api_tokens
    SET last_used_at = NOW(), usage_count = usage_count + 1
    WHERE token = ${token}
  `

  return result[0] as APIToken
}

export async function getUserAPITokens(userId: number): Promise<APIToken[]> {
  const result = await sql`
    SELECT * FROM api_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

  return result as APIToken[]
}

export async function revokeToken(tokenId: number, userId: number): Promise<boolean> {
  const result = await sql`
    UPDATE api_tokens
    SET is_active = false, revoked_at = NOW()
    WHERE id = ${tokenId} AND user_id = ${userId}
    RETURNING id
  `

  return result.length > 0
}

export async function logAPIUsage(token: string, endpoint: string, method: string, statusCode: number): Promise<void> {
  await sql`
    INSERT INTO api_usage_logs (token, endpoint, method, status_code)
    VALUES (${token}, ${endpoint}, ${method}, ${statusCode})
  `
}
