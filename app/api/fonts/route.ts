import { type NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const FONT_TEMP_DIR = path.join(process.cwd(), "font-temp");
const FONT_SOURCE_DIR = path.join(process.cwd(), "font-source");

// Ensure font-source directory exists
async function ensureFontSourceDir() {
  if (!existsSync(FONT_SOURCE_DIR)) {
    await mkdir(FONT_SOURCE_DIR, { recursive: true });
  }
}

// Generate or get session ID from header
async function getSessionId(request: NextRequest): Promise<string> {
  const sessionId = request.headers.get("x-font-session-id");
  return sessionId || "default-session";
}

// Get user's session directory
function getUserSessionDir(sessionId: string): string {
  return path.join(FONT_TEMP_DIR, sessionId);
}

// Ensure user's session directory exists
async function ensureUserDirectory(sessionId: string) {
  const userDir = getUserSessionDir(sessionId);
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true });
  }
  return userDir;
}

// GET: List all uploaded fonts
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionId(request);
    const userDir = await ensureUserDirectory(sessionId);

    // Ensure directory exists before reading
    if (!existsSync(userDir)) {
      console.log(`[GET] Creating user directory: ${userDir}`);
      await mkdir(userDir, { recursive: true });
    }

    const files = await readdir(userDir);
    const fontFiles = files.filter((file) =>
      /\.(ttf|otf|woff|woff2|eot|svg)$/i.test(file),
    );

    console.log(`[GET] Session: ${sessionId}, Found ${fontFiles.length} fonts`);

    const fonts = fontFiles.map((file) => ({
      id: Buffer.from(file).toString("base64"),
      name: file,
      path: `/api/fonts/preview/${encodeURIComponent(file)}?sessionId=${sessionId}`,
    }));

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error listing fonts:", error);
    return NextResponse.json(
      { error: "Failed to list fonts" },
      { status: 500 },
    );
  }
}

// POST: Upload new font
export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionId(request);
    const userDir = await ensureUserDirectory(sessionId);
    await ensureFontSourceDir();
    const formData = await request.formData();
    const files = formData.getAll("fonts") as File[];

    console.log(
      `[POST] Session: ${sessionId}, Uploading ${files.length} files`,
    );

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No font files provided" },
        { status: 400 },
      );
    }

    const uploadedFonts = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name.replace(/[^a-zA-Z0-9.\-_\u4e00-\u9fa5]/g, "_");

      // Save to user's session directory
      const userFilePath = path.join(userDir, fileName);
      await writeFile(userFilePath, buffer);

      // Also save to font-source for permanent storage
      const sourceFilePath = path.join(FONT_SOURCE_DIR, fileName);
      await writeFile(sourceFilePath, buffer);

      console.log(`[Upload] Saved to session: ${userFilePath}`);
      console.log(`[Upload] Backed up to: ${sourceFilePath}`);

      uploadedFonts.push({
        id: Buffer.from(fileName).toString("base64"),
        name: fileName,
        path: `/api/fonts/preview/${encodeURIComponent(fileName)}?sessionId=${sessionId}`,
      });
    }

    return NextResponse.json({
      message: "Fonts uploaded successfully",
      fonts: uploadedFonts,
    });
  } catch (error) {
    console.error("Error uploading font:", error);
    return NextResponse.json(
      { error: "Failed to upload font" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a font (hard delete from user's session)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fontName = searchParams.get("name");

    if (!fontName) {
      return NextResponse.json(
        { error: "Font name is required" },
        { status: 400 },
      );
    }

    const sessionId = await getSessionId(request);
    const userDir = getUserSessionDir(sessionId);
    const filePath = path.join(userDir, fontName);

    // Delete the file from user's session directory only
    // Keep the backup in font-source directory
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`[Delete] Removed from session: ${filePath}`);
      console.log(
        `[Delete] Backup retained in: ${path.join(FONT_SOURCE_DIR, fontName)}`,
      );
    }

    return NextResponse.json({
      message: "Font deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting font:", error);
    return NextResponse.json(
      { error: "Failed to delete font" },
      { status: 500 },
    );
  }
}
