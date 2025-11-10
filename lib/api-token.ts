import { sql } from "./db"

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

export async function validateToken(token: string): Promise<APIToken | null> {
  console.log("[v0] Validating token:", token.substring(0, 15) + "...")

  const result = await sql`
    SELECT * FROM api_tokens
    WHERE token = ${token} AND is_active = true AND revoked_at IS NULL
  `

  if (result.length === 0) {
    console.log("[v0] Token not found or inactive")
    return null
  }

  await sql`
    UPDATE api_tokens
    SET last_used_at = NOW(), usage_count = usage_count + 1
    WHERE token = ${token}
  `

  console.log("[v0] Token validated successfully for user:", result[0].user_id)
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
