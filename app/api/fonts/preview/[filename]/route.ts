import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { cookies } from "next/headers"

const FONT_TEMP_DIR = path.join(process.cwd(), "font-temp")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    
    // Get session ID from cookie
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("font_session_id")?.value
    
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    const userDir = path.join(FONT_TEMP_DIR, sessionId)
    const filePath = path.join(userDir, decodedFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 })
    }

    const fontBuffer = await readFile(filePath)
    const ext = path.extname(decodedFilename).toLowerCase()

    const mimeTypes: Record<string, string> = {
      ".ttf": "font/ttf",
      ".otf": "font/otf",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".eot": "application/vnd.ms-fontobject",
      ".svg": "image/svg+xml",
    }

    const contentType = mimeTypes[ext] || "application/octet-stream"

    return new NextResponse(fontBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error serving font:", error)
    return NextResponse.json({ error: "Failed to serve font" }, { status: 500 })
  }
}
