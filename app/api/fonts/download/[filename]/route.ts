import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const FONT_MINI_DIR = path.join(process.cwd(), "font-mini")

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    const filePath = path.join(FONT_MINI_DIR, decodedFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
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
        "Content-Disposition": `attachment; filename="${decodedFilename}"`,
        "Content-Length": fontBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error downloading font:", error)
    return NextResponse.json(
      { error: "Failed to download font" },
      { status: 500 }
    )
  }
}
