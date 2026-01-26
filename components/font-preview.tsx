"use client"

import { useEffect, useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { FontItem } from "./font-list"

interface FontPreviewProps {
  fonts: FontItem[]
  text: string
  onTextChange: (text: string) => void
}

const DEFAULT_TEXT = "永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。\n\nThe quick brown fox jumps over the lazy dog.\n\n1234567890"

export function FontPreview({ fonts, text, onTextChange }: FontPreviewProps) {
  const [fontSize, setFontSize] = useState(18)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  const displayText = text || DEFAULT_TEXT

  // Generate unique font family names
  const fontStyles = useMemo(() => {
    return fonts.map((font) => {
      const familyName = `preview-${font.id.replace(/[^a-zA-Z0-9]/g, "")}`
      return {
        ...font,
        familyName,
      }
    })
  }, [fonts])

  // Load fonts
  useEffect(() => {
    fontStyles.forEach(async (font) => {
      if (loadedFonts.has(font.familyName)) return

      try {
        const fontFace = new FontFace(font.familyName, `url(${font.path})`)
        await fontFace.load()
        document.fonts.add(fontFace)
        setLoadedFonts((prev) => new Set([...prev, font.familyName]))
      } catch (error) {
        console.error(`Failed to load font ${font.name}:`, error)
      }
    })
  }, [fontStyles, loadedFonts])

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="preview-text" className="text-foreground">预览文字</Label>
        <Textarea
          id="preview-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={DEFAULT_TEXT}
          className="min-h-[100px] resize-none bg-background text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          输入需要提取的文字，这些文字将被包含在精简字体包中
        </p>
      </div>

      {/* Font Size Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">字体大小</Label>
          <span className="text-sm text-muted-foreground">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={([value]) => setFontSize(value)}
          min={16}
          max={72}
          step={2}
          className="w-full"
        />
      </div>

      {/* Preview Area */}
      <div className="space-y-4">
        <Label className="text-foreground">预览效果</Label>
        {fonts.length === 0 ? (
          <div className="p-8 rounded-xl bg-muted/30 border border-border text-center">
            <p className="text-muted-foreground">上传字体后即可预览效果</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {fontStyles.map((font) => (
              <div
                key={font.id}
                className="p-4 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <span className="text-sm font-medium text-foreground truncate pr-2">
                    {font.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {loadedFonts.has(font.familyName) ? "已加载" : "加载中..."}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: `"${font.familyName}", sans-serif`,
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.5,
                  }}
                  className="whitespace-pre-wrap break-words text-foreground"
                >
                  {displayText}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
