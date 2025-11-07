export interface FirebaseUser {
  userId: number
  email: string
  createdAt: string
  apiEnabled: boolean
  apiTokenCount: number
}

// Helper to check if Firebase is available and we're not in v0 environment
function isFirebaseAvailable(): boolean {
  const isV0Environment = typeof process !== "undefined" && process.env.NODE_ENV !== "production"

  if (isV0Environment) {
    // Skip Firebase in v0 preview environment
    return false
  }

  // Check if we're in a proper Node.js environment with Firebase credentials
  const hasCredentials =
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY

  // Skip Firebase when credentials are missing
  if (!hasCredentials) {
    return false
  }

  return true
}

async function getFirebaseDb() {
  if (!isFirebaseAvailable()) {
    return null
  }

  try {
    const { db } = await import("./firebase")
    return db
  } catch (error) {
    console.error("[v0] Failed to import Firebase:", error instanceof Error ? error.message : error)
    return null
  }
}

export async function createFirebaseUser(userId: number, email: string): Promise<void> {
  if (!isFirebaseAvailable()) {
    return
  }

  try {
    const db = await getFirebaseDb()
    if (!db) {
      return
    }

    const userDoc = {
      userId,
      email,
      createdAt: new Date().toISOString(),
      apiEnabled: false,
      apiTokenCount: 0,
      updatedAt: new Date().toISOString(),
    }

    await db.collection("users").doc(userId.toString()).set(userDoc)
    console.log("[v0] Firebase user document created successfully for userId:", userId)
  } catch (error) {
    console.error("[v0] Error creating Firebase user document:", error)
    // Don't throw - Firebase user creation is optional and shouldn't block registration
  }
}

export async function getFirebaseUser(userId: number): Promise<FirebaseUser | null> {
  if (!isFirebaseAvailable()) {
    return null
  }

  try {
    const db = await getFirebaseDb()
    if (!db) {
      return null
    }

    const userDoc = await db.collection("users").doc(userId.toString()).get()

    if (!userDoc.exists) {
      return null
    }

    const data = userDoc.data()

    return {
      userId: data?.userId,
      email: data?.email,
      createdAt: data?.createdAt,
      apiEnabled: data?.apiEnabled || false,
      apiTokenCount: data?.apiTokenCount || 0,
    }
  } catch (error) {
    console.log("[v0] Error fetching Firebase user document:", error instanceof Error ? error.message : error)
    return null
  }
}

export async function updateFirebaseUser(userId: number, updates: Partial<FirebaseUser>): Promise<void> {
  if (!isFirebaseAvailable()) {
    return
  }

  try {
    const db = await getFirebaseDb()
    if (!db) {
      return
    }

    await db
      .collection("users")
      .doc(userId.toString())
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    console.log("[v0] Firebase user document updated successfully")
  } catch (error) {
    console.log("[v0] Error updating Firebase user document:", error instanceof Error ? error.message : error)
    // Don't throw - Firebase update is optional
  }
}
