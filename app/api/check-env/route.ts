import { NextResponse } from "next/server"

export async function GET() {
  const hasGoogleClientEmail =
    typeof process.env.GOOGLE_CLIENT_EMAIL === "string" && process.env.GOOGLE_CLIENT_EMAIL.length > 0
  const hasGooglePrivateKey =
    typeof process.env.GOOGLE_PRIVATE_KEY === "string" && process.env.GOOGLE_PRIVATE_KEY.length > 0

  return NextResponse.json({
    hasGoogleClientEmail,
    hasGooglePrivateKey,
    // Only show sanitized information for security
    clientEmailPrefix: hasGoogleClientEmail ? process.env.GOOGLE_CLIENT_EMAIL.substring(0, 5) + "..." : null,
    privateKeyFormat: hasGooglePrivateKey
      ? process.env.GOOGLE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY")
        ? "valid"
        : "invalid format"
      : null,
  })
}
