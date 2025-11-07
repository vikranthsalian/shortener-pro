import { db, COLLECTIONS } from "./firebase"

// Web Crypto API is available globally in modern Node.js and browsers
const cryptoLib = globalThis.crypto

export interface APIToken {
  id: string
  userId: number
  userEmail: string
  token: string
  name: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
  usageCount: number
  rateLimit: number // requests per minute
}

export function generateAPIToken(): string {
  const prefix = "sp_" // Shortner Pro prefix
  const array = new Uint8Array(32)
  cryptoLib.getRandomValues(array)
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${prefix}${token}`
}

export async function createAPIToken(userId: number, userEmail: string, tokenName: string): Promise<APIToken> {
  const token = generateAPIToken()
  const apiToken: APIToken = {
    id: token,
    userId,
    userEmail,
    token,
    name: tokenName,
    createdAt: new Date().toISOString(),
    isActive: true,
    usageCount: 0,
    rateLimit: 60, // 60 requests per minute by default
  }

  // Save to Firestore
  await db.collection(COLLECTIONS.API_TOKENS).doc(token).set(apiToken)

  // Also save user info to api_users collection
  const userRef = db.collection(COLLECTIONS.API_USERS).doc(userId.toString())
  const userDoc = await userRef.get()

  if (userDoc.exists) {
    // Update existing user
    await userRef.update({
      email: userEmail,
      updatedAt: new Date().toISOString(),
    })
  } else {
    // Create new user
    await userRef.set({
      userId,
      email: userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return apiToken
}

export async function validateAPIToken(token: string): Promise<APIToken | null> {
  try {
    const tokenDoc = await db.collection(COLLECTIONS.API_TOKENS).doc(token).get()

    if (!tokenDoc.exists) {
      return null
    }

    const apiToken = tokenDoc.data() as APIToken

    if (!apiToken.isActive) {
      return null
    }

    // Update last used time and usage count
    await tokenDoc.ref.update({
      lastUsedAt: new Date().toISOString(),
      usageCount: (apiToken.usageCount || 0) + 1,
    })

    return apiToken
  } catch (error) {
    console.error("[v0] Error validating API token:", error)
    return null
  }
}

export async function getUserAPITokens(userId: number): Promise<APIToken[]> {
  try {
    console.log("[v0] Fetching tokens for user:", userId, "from Firestore")

    const collection = db.collection(COLLECTIONS.API_TOKENS)
    console.log("[v0] Collection reference created")

    const snapshot = await collection.where("userId", "==", userId).get()
    console.log("[v0] Query executed, found", snapshot.docs.length, "tokens")

    const tokens = snapshot.docs.map((doc) => {
      const data = doc.data() as APIToken
      console.log("[v0] Token data:", data.name, data.createdAt)
      return data
    })

    tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return tokens
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
    await db.collection(COLLECTIONS.API_TOKENS).doc(token).update({
      isActive: false,
      revokedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[v0] Error revoking token:", error)
    return false
  }
}

export async function logAPIUsage(token: string, endpoint: string, method: string, statusCode: number): Promise<void> {
  try {
    await db.collection(COLLECTIONS.API_USAGE).add({
      token,
      endpoint,
      method,
      statusCode,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error logging API usage:", error)
  }
}
