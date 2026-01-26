"use client"

import { useState } from "react"
import { Download, Package, FileDown, Loader2, Archive, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface SubsetResult {
  name: string
  originalName: string
  format: string
  originalSize: number
  minifiedSize: number
  downloadUrl: string
}

interface SubsetResponse {
  results: SubsetResult[]
  zipDownload?: string
}

interface DownloadPanelProps {
  selectedFonts: string[]
  text: string
  onSubset: (formats: string[], downloadAll: boolean) => Promise<SubsetResponse>
}

const OUTPUT_FORMATS = [
  { value: "ttf", label: "TTF" },
  { value: "woff", label: "WOFF" },
  { value: "woff2", label: "WOFF2" },
  { value: "eot", label: "EOT" },
  { value: "svg", label: "SVG" },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DownloadPanel({ selectedFonts, text, onSubset }: DownloadPanelProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["ttf"])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<SubsetResult[]>([])
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canProcess = selectedFonts.length > 0 && text.trim().length > 0 && selectedFormats.length > 0
  const allFormatsSelected = selectedFormats.length === OUTPUT_FORMATS.length

  const handleFormatToggle = (format: string, checked: boolean) => {
    setSelectedFormats((prev) =>
      checked ? [...prev, format] : prev.filter((f) => f !== format)
    )
  }

  const handleSelectAllFormats = (checked: boolean) => {
    if (checked) {
      setSelectedFormats(OUTPUT_FORMATS.map((f) => f.value))
    } else {
      setSelectedFormats([])
    }
  }

  const handleSubset = async (downloadAll: boolean) => {
    if (!canProcess) return

    setIsProcessing(true)
    setError(null)
    setResults([])
    setZipDownloadUrl(null)

    try {
      const response = await onSubset(selectedFormats, downloadAll)
      setResults(response.results)
      if (response.zipDownload) {
        setZipDownloadUrl(response.zipDownload)
        // Auto trigger zip download
        window.open(response.zipDownload, "_blank")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (url: string) => {
    window.open(url, "_blank")
  }

  const handleDownloadAllSequentially = async () => {
    for (const result of results) {
      await handleDownload(result.downloadUrl)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  const uniqueChars = [...new Set(text)].length

  // Group results by original font name
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.originalName]) {
        acc[result.originalName] = []
      }
      acc[result.originalName].push(result)
      return acc
    },
    {} as Record<string, SubsetResult[]>
  )

  return (
    <div className="space-y-6">
      {/* Compact Info Bar */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">已选字体</p>
            <p className="text-lg font-bold text-primary">{selectedFonts.length}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">字符数量</p>
            <p className="text-lg font-bold text-primary">{uniqueChars}</p>
          </div>
        </div>

        {/* Output Format - Inline Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">格式:</Label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSelectAllFormats(!allFormatsSelected)}
              className={cn(
                "px-2 py-1 text-xs rounded border transition-colors",
                allFormatsSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              全部
            </button>
            {OUTPUT_FORMATS.map((format) => {
              const isSelected = selectedFormats.includes(format.value)
              return (
                <button
                  key={format.value}
                  onClick={() => handleFormatToggle(format.value, !isSelected)}
                  className={cn(
                    "px-2 py-1 text-xs rounded border transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  {format.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Generate Button - Prominent */}
      <Button
        onClick={() => handleSubset(false)}
        disabled={!canProcess || isProcessing}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            处理中...
          </>
        ) : (
          <>
            <Package className="w-5 h-5 mr-2" />
            生成精简字体包
          </>
        )}
      </Button>

      {!canProcess && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedFonts.length === 0
            ? "请选择要处理的字体"
            : selectedFormats.length === 0
              ? "请选择输出格式"
              : "请输入需要提取的文字"}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results - Compact Cards */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Success Banner with Actions */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-foreground">生成成功</p>
                <p className="text-xs text-muted-foreground">共 {results.length} 个文件</p>
              </div>
            </div>
            <div className="flex gap-2">
              {results.length > 1 ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSubset(true)} 
                  className="bg-transparent"
                >
                  <Archive className="w-4 h-4 mr-1" />
                  下载全部
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(results[0].downloadUrl)}
                  className="bg-transparent"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              )}
            </div>
          </div>

          {/* File List - Compact */}
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {Object.entries(groupedResults).map(([originalName, fontResults]) => (
              <div key={originalName} className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground px-1">
                  {originalName}
                </p>
                {fontResults.map((result) => {
                  const reduction = (
                    ((result.originalSize - result.minifiedSize) /
                      result.originalSize) *
                    100
                  ).toFixed(1)

                  return (
                    <div
                      key={result.name}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <span className="px-1.5 py-0.5 text-xs rounded bg-primary/10 text-primary font-medium uppercase shrink-0">
                          {result.format}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(result.originalSize)}</span>
                          <span>→</span>
                          <span className="text-primary font-medium">
                            {formatFileSize(result.minifiedSize)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                            -{reduction}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(result.downloadUrl)}
                        className="h-7 w-7 p-0 shrink-0"
                      >
                        <FileDown className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
