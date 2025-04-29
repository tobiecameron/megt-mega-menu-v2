import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userName, sessionStartTime, sheetName } = await request.json()

    // Validate required fields
    if (!userName || !sessionStartTime || !sheetName) {
      return NextResponse.json(
        { error: "Missing required fields", details: { userName, sessionStartTime, sheetName } },
        { status: 400 },
      )
    }

    console.log("API: Initializing session in Google Sheets", { userName, sessionStartTime, sheetName })

    // Check if environment variables are available
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error("API: Missing Google API credentials")
      return NextResponse.json(
        {
          error: "Missing Google API credentials",
          success: false,
          simulatedInit: { userName, sessionStartTime, sheetName },
        },
        { status: 500 },
      )
    }

    // Set up Google Sheets API
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Spreadsheet ID
    const spreadsheetId = "170FIDR-g5sHminZUtnfJIGUt40KcIpfQVQbS8UXd514"

    try {
      // Check if the sheet already exists
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
      })

      const existingSheets = spreadsheet.data.sheets || []
      const sheetExists = existingSheets.some(
        (sheet) => sheet.properties?.title?.toLowerCase() === sheetName.toLowerCase(),
      )

      if (!sheetExists) {
        // Create a new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
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
          spreadsheetId,
          range: `${sheetName}!A1:D1`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Timestamp", "User", "Interaction", "URL"]],
          },
        })

        console.log("API: Created new sheet:", sheetName)
      } else {
        console.log("API: Sheet already exists:", sheetName)
      }

      // Add session start entry
      const formattedTimestamp = new Date(sessionStartTime).toLocaleString()
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:D`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[formattedTimestamp, userName, "Session Started", ""]],
        },
      })

      return NextResponse.json({
        success: true,
        message: "Session initialized successfully",
        sheetName,
      })
    } catch (error) {
      console.error("API: Error initializing session in Google Sheets:", error)
      return NextResponse.json(
        {
          error: "Failed to initialize session",
          details: error instanceof Error ? error.message : String(error),
          success: false,
          simulatedInit: { userName, sessionStartTime, sheetName },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Error initializing session in Google Sheets:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
