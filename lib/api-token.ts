import { sql } from "./db"
import { crypto } from "webcrypto"

export interface APIToken {
  id: number
  userId: number
  userEmail: string
  token: string
  name: string
  createdAt: string
  lastUsedAt?: string
  revokedAt?: string
  isActive: boolean
  usageCount: number
  rateLimit: number
}

export function generateAPIToken(): string {
  const prefix = "sp_" // Shortner Pro prefix
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${prefix}${token}`
}

export async function createAPIToken(userId: number, userEmail: string, tokenName: string): Promise<APIToken> {
  try {
    console.log("[v0] Generating new token...")
    const token = generateAPIToken()
    console.log("[v0] Token generated:", token.substring(0, 10) + "...")

    console.log("[v0] Inserting token into database...")
    const result = await sql`
      INSERT INTO api_tokens (token, user_id, user_email, name, created_at, is_active, usage_count, rate_limit)
      VALUES (${token}, ${userId}, ${userEmail}, ${tokenName}, NOW(), true, 0, 60)
      RETURNING id, token, user_id as "userId", user_email as "userEmail", name, 
                created_at as "createdAt", last_used_at as "lastUsedAt", revoked_at as "revokedAt",
                is_active as "isActive", usage_count as "usageCount", rate_limit as "rateLimit"
    `

    console.log("[v0] Token inserted, result:", result)

    if (!result || result.length === 0) {
      throw new Error("Failed to insert token into database")
    }

    return result[0] as APIToken
  } catch (error) {
    console.error("[v0] Error in createAPIToken:", error)
    throw error
  }
}

export async function validateAPIToken(token: string): Promise<APIToken | null> {
  try {
    const result = await sql`
      SELECT id, token, user_id as "userId", user_email as "userEmail", name, 
             created_at as "createdAt", last_used_at as "lastUsedAt", revoked_at as "revokedAt",
             is_active as "isActive", usage_count as "usageCount", rate_limit as "rateLimit"
      FROM api_tokens
      WHERE token = ${token} AND is_active = true
    `

    if (result.length === 0) {
      return null
    }

    const apiToken = result[0] as APIToken

    // Update last used time and usage count
    await sql`
      UPDATE api_tokens
      SET last_used_at = NOW(), usage_count = usage_count + 1
      WHERE token = ${token}
    `

    return apiToken
  } catch (error) {
    console.error("[v0] Error validating API token:", error)
    return null
  }
}

export async function getUserAPITokens(userId: number): Promise<APIToken[]> {
  try {
    console.log("[v0] Fetching tokens for user:", userId)

    console.log("[v0] Executing SQL query...")
    const result = await sql`
      SELECT id, token, user_id as "userId", user_email as "userEmail", name, 
             created_at as "createdAt", last_used_at as "lastUsedAt", revoked_at as "revokedAt",
             is_active as "isActive", usage_count as "usageCount", rate_limit as "rateLimit"
      FROM api_tokens
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    console.log("[v0] Query executed, found", result.length, "tokens")
    console.log("[v0] Result:", JSON.stringify(result))
    return result as APIToken[]
  } catch (error) {
    console.error("[v0] Error fetching user tokens:", error)
    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw error
  }
}

export async function revokeAPIToken(token: string): Promise<boolean> {
  try {
    await sql`
      UPDATE api_tokens
      SET is_active = false, revoked_at = NOW()
      WHERE token = ${token}
    `
    return true
  } catch (error) {
    console.error("[v0] Error revoking token:", error)
    return false
  }
}

export async function logAPIUsage(token: string, endpoint: string, method: string, statusCode: number): Promise<void> {
  try {
    await sql`
      INSERT INTO api_usage_logs (token, endpoint, method, status_code, timestamp)
      VALUES (${token}, ${endpoint}, ${method}, ${statusCode}, NOW())
    `
  } catch (error) {
    console.error("[v0] Error logging API usage:", error)
  }
}
