import bcrypt from "bcryptjs"
import { sql } from "./db"

export interface User {
  id: number
  email: string
  created_at: string
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
      SELECT id, email, created_at FROM users WHERE email = ${email}
    `
    return result.rows[0] || null
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

  return result.rows[0]
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, password_hash, created_at FROM users WHERE email = ${email}
    `

    const user = result.rows[0]
    if (!user) return null

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) return null

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("[v0] Authentication error:", error)
    return null
  }
}
