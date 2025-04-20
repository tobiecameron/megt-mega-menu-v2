import { NextResponse } from "next/server"
import { getFooterItems } from "@/lib/sanity/queries"

export async function GET() {
  try {
    const data = await getFooterItems()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching footer data:", error)
    return NextResponse.json({ error: "Failed to fetch footer data" }, { status: 500 })
  }
}

