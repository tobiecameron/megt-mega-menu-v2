import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
const SPREADSHEET_ID = "1RFjnX_OLRDsOosz8_uuuohW_FvQheHfaL-mj0wpaspM" // Your spreadsheet ID

export async function POST(request: Request) {
  try {
    const { userName, sessionStartTime, sheetName: providedSheetName } = await request.json()

    if (!userName) {
      return NextResponse.json({ error: "User name is required" }, { status: 400 })
    }

    // Use provided sheet name or generate one
    let sheetName = providedSheetName

    if (!sheetName) {
      // Format date and time for the sheet name
      const date = new Date(sessionStartTime || new Date())
      const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
      const formattedTime = `${date.getHours()}:${date.getMinutes()}`

      // Create a sheet name with user name and date/time
      sheetName = `${userName} ${formattedDate} ${formattedTime}`.substring(0, 31) // Sheets have a 31 char limit
    }

    console.log("Creating sheet with name:", sheetName)

    // Initialize auth client
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Create a new sheet/tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    })

    // Add headers to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Timestamp", "Action", "Item Title", "URL", "User"]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Session initialized successfully",
      sheetName,
    })
  } catch (error) {
    console.error("Error initializing session:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

