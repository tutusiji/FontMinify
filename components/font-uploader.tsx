"use client"

import React from "react"

import { useCallback, useState } from "react"
import { Upload, X, FileType } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FontUploaderProps {
  onUpload: (files: File[]) => Promise<void>
  isUploading: boolean
}

const ACCEPTED_FORMATS = [".ttf", ".otf", ".woff", ".woff2", ".eot", ".svg"]

export function FontUploader({ onUpload, isUploading }: FontUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      ACCEPTED_FORMATS.some((ext) => file.name.toLowerCase().endsWith(ext))
    )

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        ACCEPTED_FORMATS.some((ext) => file.name.toLowerCase().endsWith(ext))
      )

      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files])
      }
      e.target.value = ""
    },
    []
  )

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      await onUpload(selectedFiles)
      setSelectedFiles([])
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_FORMATS.join(",")}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? "释放文件以上传" : "拖放字体文件到这里"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              或点击选择文件
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            支持输出格式: TTF, OTF, WOFF, WOFF2, EOT, SVG
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            注: Fontmin 仅支持 TTF 格式作为输入进行子集提取
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              已选择 {selectedFiles.length} 个文件
            </span>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? "上传中..." : "开始上传"}
            </Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileType className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
