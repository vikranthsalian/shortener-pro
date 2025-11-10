import { NextResponse } from "next/server"
import { initializeApp, cert, deleteApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { projectId, clientEmail, privateKey } = await request.json()

    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json({ success: false, error: "Missing required credentials" }, { status: 400 })
    }

    console.log("[v0] Verifying Firebase connection for project:", projectId)

    const existingCredentials = await db
      .collection("user_firebase_credentials")
      .where("projectId", "==", projectId.trim())
      .limit(1)
      .get()

    if (!existingCredentials.empty) {
      console.log("[v0] Duplicate Firebase project ID found:", projectId)
      return NextResponse.json(
        {
          success: false,
          error: "This Firebase project has already been registered",
          details: "Each Firebase project can only be connected once",
        },
        { status: 409 },
      )
    }

    // Create a temporary app for verification
    const appName = `verify-${Date.now()}`
    let app

    try {
      // Initialize Firebase with provided credentials
      app = initializeApp(
        {
          credential: cert({
            projectId: projectId.trim(),
            clientEmail: clientEmail.trim(),
            privateKey: privateKey.trim().replace(/\\n/g, "\n"),
          }),
        },
        appName,
      )

      // Try to access Firestore to verify connection
      const firestore = getFirestore(app)

      // Attempt to list collections as a connection test
      const collections = await firestore.listCollections()

      console.log("[v0] Firebase connection verified successfully")
      console.log("[v0] Found collections:", collections.length)

      // Clean up the temporary app
      await deleteApp(app)

      return NextResponse.json({
        success: true,
        message: "Firebase connection verified successfully",
        collectionsFound: collections.length,
      })
    } catch (error) {
      // Clean up if app was created
      if (app) {
        try {
          await deleteApp(app)
        } catch (cleanupError) {
          console.error("[v0] Error cleaning up Firebase app:", cleanupError)
        }
      }

      console.error("[v0] Firebase verification failed:", error)

      let errorMessage = "Failed to connect to Firebase"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: "Please check your credentials and ensure the service account has Firestore permissions",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[v0] Error in firebase-verify endpoint:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
