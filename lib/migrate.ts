import { sql } from "./db"

let migrationRun = false

export async function runMigration() {
  if (migrationRun) return

  try {
    console.log("[v0] Starting database migration...")

    // Create URLs table
    await sql`
      CREATE TABLE IF NOT EXISTS urls (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(10) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        user_id VARCHAR(255),
        title VARCHAR(255),
        description TEXT
      )
    `

    // Create clicks table
    await sql`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        referrer TEXT,
        ip_address VARCHAR(45),
        country VARCHAR(2),
        device_type VARCHAR(50)
      )
    `

    // Create impressions table
    await sql`
      CREATE TABLE IF NOT EXISTS impressions (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
        impressed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ad_type VARCHAR(50),
        user_agent TEXT,
        ip_address VARCHAR(45)
      )
    `

    // Create analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_clicks INTEGER DEFAULT 0,
        total_impressions INTEGER DEFAULT 0,
        estimated_earnings DECIMAL(10, 2) DEFAULT 0,
        UNIQUE(url_id, date)
      )
    `

    // Create users table for authentication
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code)`
    await sql`CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(clicked_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_impressions_url_id ON impressions(url_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_analytics_url_id ON analytics(url_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`

    migrationRun = true
    console.log("[v0] Database migration completed successfully")
  } catch (error) {
    console.error("[v0] Migration error:", error)
    throw error
  }
}
