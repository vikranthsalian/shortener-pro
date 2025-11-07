import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Firebase test endpoint called")

  try {
    // Check environment variables
    const envCheck = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    }

    console.log("[v0] Environment variables check:", envCheck)

    // Try to import Firebase
    console.log("[v0] Attempting to import firebase module...")
    const { db, COLLECTIONS } = await import("@/lib/firebase")
    console.log("[v0] Firebase module imported successfully")

    // Try a simple Firestore operation
    console.log("[v0] Attempting to access Firestore collection...")
    const testCollection = db.collection(COLLECTIONS.API_TOKENS)
    console.log("[v0] Collection reference created successfully")

    return NextResponse.json({
      status: "success",
      message: "Firebase is initialized and working",
      envVariables: envCheck,
      collectionsAvailable: Object.keys(COLLECTIONS),
    })
  } catch (error) {
    console.error("[v0] Firebase test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
