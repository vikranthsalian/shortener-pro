import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

      if (!projectId || !clientEmail || !privateKey) {
        console.error(
          "[v0] Firebase configuration missing. Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
        )
        throw new Error("Firebase configuration is incomplete")
      }

      console.log("[v0] Initializing Firebase Admin SDK...")
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
      console.log("[v0] Firebase Admin SDK initialized successfully")
    }
    return getFirestore()
  } catch (error) {
    console.error("[v0] Firebase initialization error:", error)
    throw error
  }
}

export const db = initializeFirebaseAdmin()

// Collections
export const COLLECTIONS = {
  API_USERS: "api_users",
  API_TOKENS: "api_tokens",
  API_USAGE: "api_usage",
}
