import { NextResponse } from "next/server"
import { initializeApp, cert, deleteApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { db } from "@/lib/firebase"

function generateToken(): string {
  const array = new Uint8Array(32)
  globalThis.crypto.getRandomValues(array)
  return "sp_" + Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const { userId, userEmail, tokenName } = await request.json()

    if (!userId || !userEmail || !tokenName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating token with user's Firebase credentials for user:", userId)

    // Fetch user's Firebase credentials
    const userCredRef = db.collection("user_firebase_credentials").doc(userId.toString())
    const credDoc = await userCredRef.get()

    if (!credDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Firebase credentials not found. Please verify and save your credentials first." },
        { status: 404 },
      )
    }

    const credentials = credDoc.data()
    const appName = `user-${userId}-${Date.now()}`
    let userApp

    try {
      // Initialize Firebase with user's credentials
      userApp = initializeApp(
        {
          credential: cert({
            projectId: credentials?.projectId,
            clientEmail: credentials?.clientEmail,
            privateKey: credentials?.privateKey?.replace(/\\n/g, "\n"),
          }),
        },
        appName,
      )

      const userFirestore = getFirestore(userApp)

      // Generate token
      const token = generateToken()
      const tokenId = token.substring(3, 15) // Use part of token as ID

      // Create token document in user's Firebase
      const tokenDoc = {
        id: tokenId,
        userId,
        userEmail,
        token,
        name: tokenName,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        isActive: true,
        usageCount: 0,
        rateLimit: 1000,
      }

      await userFirestore.collection("api_tokens").doc(tokenId).add(tokenDoc)

      console.log("[v0] Token created successfully in user's Firebase")

      // Clean up
      await deleteApp(userApp)

      return NextResponse.json({
        success: true,
        token: tokenDoc,
      })
    } catch (error) {
      // Clean up if app was created
      if (userApp) {
        try {
          await deleteApp(userApp)
        } catch (cleanupError) {
          console.error("[v0] Error cleaning up Firebase app:", cleanupError)
        }
      }

      console.error("[v0] Error creating token with user's Firebase:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create token in your Firebase database" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Error in create-with-firebase endpoint:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
