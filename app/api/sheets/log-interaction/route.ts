import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { title, url, userName, sheetName, timestamp } = await request.json()

    // Validate required fields
    if (!title || !url || !userName || !sheetName) {
      return NextResponse.json(
        { error: "Missing required fields", details: { title, url, userName, sheetName } },
        { status: 400 },
      )
    }

    console.log("API: Logging interaction to Google Sheets", { title, url, userName, sheetName })

    // Check if environment variables are available
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error("API: Missing Google API credentials")
      return NextResponse.json(
        {
          error: "Missing Google API credentials",
          success: false,
          simulatedLog: { title, url, userName, timestamp, sheetName },
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

    // Format the timestamp
    const formattedTimestamp = new Date(timestamp).toLocaleString()

    // Prepare the values to append
    const values = [[formattedTimestamp, userName, title, url]]

    // First, check if the sheet exists
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
      })

      const existingSheets = spreadsheet.data.sheets || []
      const sheetExists = existingSheets.some(
        (sheet) => sheet.properties?.title?.toLowerCase() === sheetName.toLowerCase(),
      )

      if (!sheetExists) {
        // Create the sheet if it doesn't exist
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
      }
    } catch (error) {
      console.error("API: Error checking/creating sheet:", error)
      return NextResponse.json(
        {
          error: "Failed to check/create sheet",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Append the values to the sheet
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:D`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values,
        },
      })

      console.log("API: Successfully logged to Google Sheets", response.data)

      return NextResponse.json({
        success: true,
        message: "Interaction logged successfully",
      })
    } catch (error) {
      console.error("API: Error appending values to sheet:", error)
      return NextResponse.json(
        {
          error: "Failed to append values to sheet",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Error logging interaction to Google Sheets:", error)
    return NextResponse.json(
      {
        error: "Failed to log interaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
