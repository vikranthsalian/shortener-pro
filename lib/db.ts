import { neon } from "@neondatabase/serverless"

// Create the Neon client on first use so build-time route analysis does not
// require production-only database environment variables.
let client: ReturnType<typeof neon> | undefined

function getClient() {
  if (!client) {
    const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("NEON_DATABASE_URL or DATABASE_URL must be configured")
    }

    client = neon(connectionString)
  }

  return client
}

const sql = ((...args: Parameters<ReturnType<typeof neon>>) => getClient()(...args)) as ReturnType<typeof neon>

export { sql }
