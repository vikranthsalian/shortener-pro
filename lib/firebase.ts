console.log("[v0] firebase.ts module is being loaded...")

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  console.log("[v0] initializeFirebaseAdmin() function called")

  try {
    console.log("[v0] Checking existing Firebase apps, count:", getApps().length)

    if (getApps().length === 0) {
      console.log("[v0] No existing Firebase apps, initializing new one...")

      const projectId = process.env.FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

      console.log("[v0] Environment variables check:")
      console.log("[v0] - FIREBASE_PROJECT_ID:", projectId ? "SET" : "MISSING")
      console.log("[v0] - FIREBASE_CLIENT_EMAIL:", clientEmail ? "SET" : "MISSING")
      console.log("[v0] - FIREBASE_PRIVATE_KEY:", privateKey ? "SET (length: " + privateKey.length + ")" : "MISSING")

      if (!projectId || !clientEmail || !privateKey) {
        const missing = []
        if (!projectId) missing.push("FIREBASE_PROJECT_ID")
        if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL")
        if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY")

        console.error("[v0] Missing Firebase environment variables:", missing.join(", "))
        throw new Error(`Missing Firebase credentials: ${missing.join(", ")}`)
      }

      console.log("[v0] All Firebase credentials present, initializing with project:", projectId)

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })

      console.log("[v0] Firebase Admin SDK initialized successfully!")
    } else {
      console.log("[v0] Firebase app already exists, reusing existing instance")
    }

    const firestore = getFirestore()
    console.log("[v0] Firestore instance obtained successfully")
    return firestore
  } catch (error) {
    console.error("[v0] Firebase initialization error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw error
  }
}

console.log("[v0] About to call initializeFirebaseAdmin()...")
export const db = initializeFirebaseAdmin()
console.log("[v0] Firebase db exported, initialization complete")

// Collections
export const COLLECTIONS = {
  API_USERS: "api_users",
  API_TOKENS: "api_tokens",
  API_USAGE: "api_usage",
}

console.log("[v0] Firebase module loaded successfully")
