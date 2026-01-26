import { type NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync, createWriteStream } from "fs";
import path from "path";
import Fontmin from "fontmin";
import archiver from "archiver";
import ttf2woff2 from "ttf2woff2";

const FONT_SOURCE_DIR = path.join(process.cwd(), "font-source");
const FONT_MINI_DIR = path.join(process.cwd(), "font-mini");

// Ensure font-mini directory exists
async function ensureMiniDir() {
  if (!existsSync(FONT_MINI_DIR)) {
    await mkdir(FONT_MINI_DIR, { recursive: true });
  }
}

// Check if font is TTF format (Fontmin only supports TTF input)
function isTTFFont(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".ttf";
}

// Process font with Fontmin - directly from source path
async function processFont(
  sourcePath: string,
  text: string,
  format: string,
): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[processFont] Starting: ${sourcePath}, format: ${format}`);
      
      const fontmin = new Fontmin().src(sourcePath);

      // Extract glyphs for subset
      fontmin.use(
        Fontmin.glyph({
          text: text,
          hinting: false,
        }),
      );

      // Convert to target format if needed
      // For woff2, we'll handle it separately after getting the TTF
      switch (format) {
        case "woff":
          fontmin.use(Fontmin.ttf2woff());
          break;
        case "eot":
          fontmin.use(Fontmin.ttf2eot());
          break;
        case "svg":
          fontmin.use(Fontmin.ttf2svg());
          break;
        // For woff2 and ttf, we just need the TTF output
      }

      fontmin.run((err, files) => {
        if (err) {
          console.error("[processFont] Fontmin error:", err);
          reject(new Error(`Fontmin 处理失败: ${err.message || String(err)}`));
          return;
        }

        if (!files || files.length === 0) {
          console.warn("[processFont] Fontmin returned no files");
          reject(new Error("Fontmin 未返回任何文件"));
          return;
        }

        console.log(`[processFont] Received ${files.length} files`);

        // For woff2, we need to convert TTF to WOFF2 using ttf2woff2
        if (format === "woff2") {
          // Find the TTF file
          for (const file of files) {
            const filePath = file.path || "";
            console.log(`[processFont] Checking file: ${filePath}`);
            if (filePath.endsWith(".ttf")) {
              try {
                const ttfBuffer = file.contents as Buffer;
                console.log(`[processFont] Converting TTF to WOFF2, size: ${ttfBuffer.length}`);
                const woff2Buffer = ttf2woff2(ttfBuffer);
                console.log(`[processFont] WOFF2 conversion successful, size: ${woff2Buffer.length}`);
                resolve(Buffer.from(woff2Buffer));
                return;
              } catch (conversionError) {
                console.error("[processFont] Error converting TTF to WOFF2:", conversionError);
                reject(new Error(`TTF 转 WOFF2 失败: ${conversionError instanceof Error ? conversionError.message : String(conversionError)}`));
                return;
              }
            }
          }
          console.warn("[processFont] No TTF file found for WOFF2 conversion");
          reject(new Error("未找到 TTF 文件用于 WOFF2 转换"));
          return;
        }

        // Find the correct output file by extension
        const targetExt = `.${format}`;
        for (const file of files) {
          const filePath = file.path || "";
          console.log(`[processFont] Checking file for ${targetExt}: ${filePath}`);
          if (filePath.endsWith(targetExt)) {
            console.log(`[processFont] Found target file, size: ${(file.contents as Buffer).length}`);
            resolve(file.contents as Buffer);
            return;
          }
        }

        // For TTF format, return the first .ttf file
        if (format === "ttf") {
          for (const file of files) {
            const filePath = file.path || "";
            if (filePath.endsWith(".ttf")) {
              console.log(`[processFont] Found TTF file, size: ${(file.contents as Buffer).length}`);
              resolve(file.contents as Buffer);
              return;
            }
          }
        }

        console.warn(`[processFont] No output file found for format: ${format}`);
        reject(new Error(`未找到 ${format} 格式的输出文件`));
      });
    } catch (error) {
      console.error("[processFont] Unexpected error:", error);
      reject(new Error(`字体处理异常: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

export async function POST(request: NextRequest) {
  console.log("[API] Font subset request received");
  try {
    console.log("[API] Ensuring mini directory exists");
    await ensureMiniDir();

    console.log("[API] Parsing request body");
    const {
      fontNames,
      text,
      outputFormats = ["ttf"],
      downloadAll = false,
    } = await request.json();

    console.log("[API] Request params:", {
      fontNames,
      textLength: text?.length,
      outputFormats,
      downloadAll,
    });

    if (!fontNames || fontNames.length === 0) {
      return NextResponse.json({ error: "请选择字体" }, { status: 400 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入需要提取的文字" },
        { status: 400 },
      );
    }

    // Verify font-source directory exists
    if (!existsSync(FONT_SOURCE_DIR)) {
      console.error("[API] font-source directory not found");
      return NextResponse.json(
        { error: "字体源目录不存在" },
        { status: 500 },
      );
    }

    // Remove duplicates from text
    const uniqueText = [...new Set(text)].join("");

    const results: Array<{
      name: string;
      originalName: string;
      format: string;
      originalSize: number;
      minifiedSize: number;
      downloadUrl: string;
    }> = [];

    const filesToZip: Array<{ name: string; buffer: Buffer }> = [];
    const skippedFonts: string[] = [];
    const errors: string[] = [];

    for (const fontName of fontNames) {
      console.log(`[API] Processing font: ${fontName}`);
      const sourcePath = path.join(FONT_SOURCE_DIR, fontName);

      if (!existsSync(sourcePath)) {
        console.warn(`[API] Font not found: ${fontName}`);
        continue;
      }

      // Check if font is TTF format
      if (!isTTFFont(fontName)) {
        console.warn(`[API] Font is not TTF format: ${fontName}`);
        skippedFonts.push(fontName);
        continue;
      }

      const fontBuffer = await readFile(sourcePath);
      const originalSize = fontBuffer.length;
      const baseName = path.basename(fontName, path.extname(fontName));

      console.log(
        `[API] Font loaded: ${fontName}, size: ${originalSize} bytes`,
      );

      // Process each selected format
      for (const format of outputFormats) {
        console.log(`[API] Converting ${fontName} to ${format}`);
        try {
          const outputBuffer = await processFont(
            sourcePath,
            uniqueText,
            format,
          );

          if (outputBuffer) {
            // Generate output filename with _Lite suffix
            const outputName = `${baseName}_Lite.${format}`;
            const outputPath = path.join(FONT_MINI_DIR, outputName);

            await writeFile(outputPath, outputBuffer);

            results.push({
              name: outputName,
              originalName: fontName,
              format,
              originalSize,
              minifiedSize: outputBuffer.length,
              downloadUrl: `/api/fonts/download/${encodeURIComponent(outputName)}`,
            });

            if (downloadAll) {
              filesToZip.push({ name: outputName, buffer: outputBuffer });
            }
          } else {
            const errorMsg = `转换 ${fontName} 到 ${format} 格式失败：无输出`;
            console.error(`[API] ${errorMsg}`);
            errors.push(errorMsg);
          }
        } catch (formatError) {
          const errorMsg = `转换 ${fontName} 到 ${format} 格式失败：${formatError instanceof Error ? formatError.message : String(formatError)}`;
          console.error(`[API] ${errorMsg}`, formatError);
          errors.push(errorMsg);
        }
      }
    }

    if (results.length === 0) {
      let errorMsg = "处理失败。";
      if (skippedFonts.length > 0) {
        errorMsg = `Fontmin 仅支持 TTF 格式的字体文件。以下字体被跳过: ${skippedFonts.join(", ")}。请上传 TTF 格式的字体。`;
      } else if (errors.length > 0) {
        errorMsg = `处理失败：${errors.join("; ")}`;
      } else {
        errorMsg = "处理失败，请确保上传的是有效的 TTF 格式字体文件。";
      }
      return NextResponse.json({ error: errorMsg, details: errors }, { status: 400 });
    }

    // If downloadAll is true and we have multiple files, create a zip
    if (downloadAll && filesToZip.length > 0) {
      const zipName = `fonts_Lite_${Date.now()}.zip`;
      const zipPath = path.join(FONT_MINI_DIR, zipName);

      // Create zip file
      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => resolve());
        archive.on("error", (err: Error) => reject(err));

        archive.pipe(output);

        for (const file of filesToZip) {
          archive.append(file.buffer, { name: file.name });
        }

        archive.finalize();
      });

      return NextResponse.json({
        message: "字体处理成功",
        results,
        textLength: uniqueText.length,
        zipDownload: `/api/fonts/download/${encodeURIComponent(zipName)}`,
        skippedFonts: skippedFonts.length > 0 ? skippedFonts : undefined,
        warnings: errors.length > 0 ? errors : undefined,
      });
    }

    return NextResponse.json({
      message: "字体处理成功",
      results,
      textLength: uniqueText.length,
      skippedFonts: skippedFonts.length > 0 ? skippedFonts : undefined,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[API] Error minifying font:", error);
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[API] Error stack:", errorStack);
    
    return NextResponse.json(
      {
        error: `处理失败: ${errorMessage}`,
        details: errorStack,
      },
      { status: 500 },
    );
  }
}
