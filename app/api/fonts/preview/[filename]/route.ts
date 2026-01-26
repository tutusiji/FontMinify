import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const FONT_SOURCE_DIR = path.join(process.cwd(), "font-source")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    const filePath = path.join(FONT_SOURCE_DIR, decodedFilename)

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
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error serving font:", error)
    return NextResponse.json({ error: "Failed to serve font" }, { status: 500 })
  }
}
