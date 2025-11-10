import bcrypt from "bcryptjs"
import { sql } from "./db"

export interface User {
  id: number
  email: string
  created_at: string
  is_super_admin?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, created_at, is_super_admin FROM users WHERE email = ${email}
    `
    return result[0] || null
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return null
  }
}

export async function createUser(email: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email, created_at
  `
  return result[0]
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, password_hash, created_at, is_super_admin FROM users WHERE email = ${email}
    `
    const user = result[0]
    if (!user) return null

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) return null

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      is_super_admin: user.is_super_admin || false,
    }
  } catch (error) {
    console.error("[v0] Authentication error:", error)
    return null
  }
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, created_at, is_super_admin FROM users WHERE google_id = ${googleId}
    `
    return result[0] || null
  } catch (error) {
    console.error("[v0] Error fetching user by Google ID:", error)
    return null
  }
}

export async function createOAuthUser(email: string, googleId: string, name: string, image?: string): Promise<User> {
  try {
    const result = await sql`
      INSERT INTO users (email, google_id, provider, name, image)
      VALUES (${email}, ${googleId}, 'google', ${name}, ${image || null})
      RETURNING id, email, created_at
    `
    return result[0]
  } catch (error) {
    console.error("[v0] Error creating OAuth user:", error)
    throw error
  }
}

export async function getOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string,
  image?: string,
): Promise<User> {
  // Check if user exists by Google ID
  let user = await getUserByGoogleId(googleId)
  if (user) return user

  // Check if user exists by email
  user = await getUserByEmail(email)
  if (user) return user

  // Create new user
  return createOAuthUser(email, googleId, name, image)
}

export async function isSuperAdmin(email: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT is_super_admin FROM users WHERE email = ${email}
    `
    return result[0]?.is_super_admin || false
  } catch (error) {
    console.error("[v0] Error checking super admin:", error)
    return false
  }
}
