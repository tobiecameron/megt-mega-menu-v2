import { NextResponse } from "next/server"
import { getMenuData } from "@/lib/sanity/queries"

export async function GET() {
  try {
    const data = await getMenuData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching menu data:", error)
    return NextResponse.json({ error: "Failed to fetch menu data" }, { status: 500 })
  }
}

