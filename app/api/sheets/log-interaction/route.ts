import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SPREADSHEET_ID = "1RFjnX_OLRDsOosz8_uuuohW_FvQheHfaL-mj0wpaspM" // Your spreadsheet ID

export async function POST(request: Request) {
  try {
    const { title, url, userName, sheetName, timestamp } = await request.json()

    if (!title || !userName || !sheetName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize auth client
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Append the interaction to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[timestamp || new Date().toISOString(), "Click", title, url, userName]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Interaction logged successfully",
    })
  } catch (error) {
    console.error("Error logging interaction:", error)
    return NextResponse.json({ error: "Failed to log interaction" }, { status: 500 })
  }
}

