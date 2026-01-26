import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readdir, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const FONT_SOURCE_DIR = path.join(process.cwd(), "font-source")
const FONT_MINI_DIR = path.join(process.cwd(), "font-mini")

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(FONT_SOURCE_DIR)) {
    await mkdir(FONT_SOURCE_DIR, { recursive: true })
  }
  if (!existsSync(FONT_MINI_DIR)) {
    await mkdir(FONT_MINI_DIR, { recursive: true })
  }
}

// GET: List all uploaded fonts
export async function GET() {
  try {
    await ensureDirectories()
    const files = await readdir(FONT_SOURCE_DIR)
    const fontFiles = files.filter((file) =>
      /\.(ttf|otf|woff|woff2|eot|svg)$/i.test(file)
    )

    const fonts = fontFiles.map((file) => ({
      id: Buffer.from(file).toString("base64"),
      name: file,
      path: `/api/fonts/preview/${encodeURIComponent(file)}`,
    }))

    return NextResponse.json({ fonts })
  } catch (error) {
    console.error("Error listing fonts:", error)
    return NextResponse.json({ error: "Failed to list fonts" }, { status: 500 })
  }
}

// POST: Upload new font
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()
    const formData = await request.formData()
    const files = formData.getAll("fonts") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No font files provided" },
        { status: 400 }
      )
    }

    const uploadedFonts = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = file.name.replace(/[^a-zA-Z0-9.\-_\u4e00-\u9fa5]/g, "_")
      const filePath = path.join(FONT_SOURCE_DIR, fileName)

      await writeFile(filePath, buffer)
      uploadedFonts.push({
        id: Buffer.from(fileName).toString("base64"),
        name: fileName,
        path: `/api/fonts/preview/${encodeURIComponent(fileName)}`,
      })
    }

    return NextResponse.json({
      message: "Fonts uploaded successfully",
      fonts: uploadedFonts,
    })
  } catch (error) {
    console.error("Error uploading font:", error)
    return NextResponse.json(
      { error: "Failed to upload font" },
      { status: 500 }
    )
  }
}

// DELETE: Remove a font from list (soft delete - file remains in font-source)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fontName = searchParams.get("name")

    if (!fontName) {
      return NextResponse.json(
        { error: "Font name is required" },
        { status: 400 }
      )
    }

    // Note: We don't actually delete the file from font-source
    // Just return success to remove it from the UI list
    // The file will remain in font-source directory for future use

    return NextResponse.json({ 
      message: "Font removed from list successfully",
      note: "File remains in font-source directory"
    })
  } catch (error) {
    console.error("Error removing font from list:", error)
    return NextResponse.json(
      { error: "Failed to remove font from list" },
      { status: 500 }
    )
  }
}
