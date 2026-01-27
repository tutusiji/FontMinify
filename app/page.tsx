"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { Sparkles } from "lucide-react";
import { FontUploader } from "@/components/font-uploader";
import { FontList, type FontItem } from "@/components/font-list";
import { FontPreview } from "@/components/font-preview";
import { DownloadPanel } from "@/components/download-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { getSessionId } from "@/lib/session";

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      "x-font-session-id": getSessionId(),
    },
  }).then((res) => res.json());

export default function FontMinPage() {
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data, error } = useSWR<{ fonts: FontItem[] }>("/api/fonts", fetcher, {
    refreshInterval: 0,
  });

  const fonts = data?.fonts || [];

  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("fonts", file));

      const response = await fetch("/api/fonts", {
        method: "POST",
        headers: {
          "x-font-session-id": getSessionId(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const result = await response.json();
      await mutate("/api/fonts");

      // Auto select newly uploaded fonts
      if (result.fonts && Array.isArray(result.fonts)) {
        const newFontNames = result.fonts.map((f: any) => f.name);
        setSelectedFonts((prev) => [...new Set([...prev, ...newFontNames])]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDelete = useCallback(async (fontName: string) => {
    setIsDeleting(fontName);
    try {
      const response = await fetch(
        `/api/fonts?name=${encodeURIComponent(fontName)}`,
        {
          method: "DELETE",
          headers: {
            "x-font-session-id": getSessionId(),
          },
        },
      );

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setSelectedFonts((prev) => prev.filter((name) => name !== fontName));
      await mutate("/api/fonts");
    } catch (error) {
      console.error("Delete error:", error);
      alert("删除失败，请重试");
    } finally {
      setIsDeleting(null);
    }
  }, []);

  const handleSelectFont = useCallback(
    (fontName: string, selected: boolean) => {
      setSelectedFonts((prev) =>
        selected
          ? [...prev, fontName]
          : prev.filter((name) => name !== fontName),
      );
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedFonts.length === fonts.length) {
      setSelectedFonts([]);
    } else {
      setSelectedFonts(fonts.map((f) => f.name));
    }
  }, [fonts, selectedFonts.length]);

  const handleSubset = useCallback(
    async (formats: string[], downloadAll: boolean) => {
      const response = await fetch("/api/fonts/subset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-font-session-id": getSessionId(),
        },
        body: JSON.stringify({
          fontNames: selectedFonts,
          text: previewText,
          outputFormats: formats,
          downloadAll,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "处理失败";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { results: data.results, zipDownload: data.zipDownload };
    },
    [selectedFonts, previewText],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/icon.svg"
                alt="FontMin Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                FontMin - 字里行间
              </h1>
              <p className="text-sm text-muted-foreground">字体子集抽取工具</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Font List */}
          <div className="space-y-6 lg:col-span-1">
            {/* Upload */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Sparkles className="w-5 h-5 text-primary" />
                  上传字体
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FontUploader
                  onUpload={handleUpload}
                  isUploading={isUploading}
                />
              </CardContent>
            </Card>

            {/* Font List */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">
                  已上传字体
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-center py-4 text-destructive">
                    加载失败，请刷新页面
                  </div>
                ) : (
                  <FontList
                    fonts={fonts}
                    selectedFonts={selectedFonts}
                    onSelect={handleSelectFont}
                    onSelectAll={handleSelectAll}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview (Expanded) */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">
                  字体预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FontPreview
                  fonts={fonts}
                  text={previewText}
                  onTextChange={setPreviewText}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Download Panel - Bottom Full Width */}
        <div className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-foreground">
                下载设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DownloadPanel
                selectedFonts={selectedFonts}
                text={previewText}
                onSubset={handleSubset}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            支持 TTF, OTF, WOFF, WOFF2, EOT, SVG 格式
            {/* • 使用{" "}
            <a
              href="https://github.com/ecomfe/fontmin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Fontmin
            </a>{" "}
            技术 */}
          </p>
          {/* <p className="mt-1">
            原始字体保存在 font-source 文件夹 • 精简字体保存在 font-mini 文件夹
          </p> */}
        </div>
      </main>
    </div>
  );
}
