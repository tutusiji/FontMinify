"use client"

import { useState } from "react"
import { Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export interface FontItem {
  id: string
  name: string
  path: string
}

interface FontListProps {
  fonts: FontItem[]
  selectedFonts: string[]
  onSelect: (fontName: string, selected: boolean) => void
  onSelectAll: () => void
  onDelete: (fontName: string) => void
  isDeleting: string | null
}

export function FontList({
  fonts,
  selectedFonts,
  onSelect,
  onSelectAll,
  onDelete,
  isDeleting,
}: FontListProps) {
  const [fontToDelete, setFontToDelete] = useState<string | null>(null)
  const allSelected = fonts.length > 0 && selectedFonts.length === fonts.length

  const handleDeleteClick = (fontName: string) => {
    setFontToDelete(fontName)
  }

  const handleConfirmDelete = () => {
    if (fontToDelete) {
      onDelete(fontToDelete)
      setFontToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setFontToDelete(null)
  }

  if (fonts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暂无字体</p>
        <p className="text-sm mt-1">请上传字体文件</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer text-foreground"
            >
              全选 ({selectedFonts.length}/{fonts.length})
            </label>
          </div>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {fonts.map((font) => {
            const isSelected = selectedFonts.includes(font.name)
            const isCurrentlyDeleting = isDeleting === font.name

            return (
              <div
                key={font.id}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-lg border transition-all",
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelect(font.name, checked === true)
                    }
                    id={font.id}
                  />
                  <label
                    htmlFor={font.id}
                    className="text-sm font-medium cursor-pointer truncate text-foreground"
                  >
                    {font.name}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(font.name)}
                    disabled={isCurrentlyDeleting}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fontToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除字体</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 <span className="font-medium text-foreground">{fontToDelete}</span> 吗？
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
