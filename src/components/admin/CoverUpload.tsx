"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverUploadProps {
  initialCoverUrl?: string;
  onCoverChange: (url: string) => void;
}

export function CoverUpload({ initialCoverUrl = "", onCoverChange }: CoverUploadProps) {
  const [coverUrl, setCoverUrl] = useState<string>(initialCoverUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File type validation
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid image type. Please upload JPG, PNG, or WebP.");
      return;
    }

    // 2. File size validation
    if (file.size > maxSizeBytes) {
      setErrorMsg("File is too large. Maximum cover size is 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // 1. Try persistent local upload first
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(40);
      const res = await fetch("/api/admin/upload-cover", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.coverUrl) {
          setCoverUrl(data.coverUrl);
          onCoverChange(data.coverUrl);
          setUploadProgress(100);
          setIsUploading(false);
          return;
        }
      }

      // 2. Supabase storage fallback
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      setUploadProgress(70);

      const { data, error } = await supabase.storage
        .from("book-covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("book-covers").getPublicUrl(data.path);

        setCoverUrl(publicUrl);
        onCoverChange(publicUrl);
      } else {
        const localUrl = URL.createObjectURL(file);
        setCoverUrl(localUrl);
        onCoverChange(localUrl);
      }
      setUploadProgress(100);
    } catch {
      const localUrl = URL.createObjectURL(file);
      setCoverUrl(localUrl);
      onCoverChange(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setCoverUrl("");
    onCoverChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
          Book Cover Image
        </label>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
            Size: 600 × 800 px (3:4 Ratio)
          </span>
          <span>• Max 5MB</span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {coverUrl ? (
        <div className="relative flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 shadow-xs">
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt="Book cover preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground">Custom Cover Active</p>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Ready
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground break-all line-clamp-1 font-mono">
              {coverUrl}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Displays on book card and details page in standard 3:4 portrait ratio.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs font-medium"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Replace Cover
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                onClick={handleRemove}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 hover:border-amber-500/60 bg-muted/10 hover:bg-muted/25 p-6 text-center cursor-pointer transition-all duration-200"
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-7 w-7 animate-spin text-amber-accent" />
              <p className="text-xs text-muted-foreground font-medium">
                Uploading cover image ({uploadProgress}%)...
              </p>
            </div>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 group-hover:bg-amber-500/20 mb-2.5 transition-all">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Click to upload custom book cover, or <span className="text-amber-500 underline">browse</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
                Recommended dimensions: <strong>600 × 800 px</strong> or <strong>900 × 1200 px</strong> (Aspect Ratio <strong>3:4</strong>).
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 text-[10px] text-muted-foreground font-mono">
                <span className="bg-background px-2 py-0.5 rounded border border-border/60">
                  Ratio: 3:4 (Portrait)
                </span>
                <span className="bg-background px-2 py-0.5 rounded border border-border/60">
                  600 × 800 px
                </span>
                <span className="bg-background px-2 py-0.5 rounded border border-border/60">
                  JPG, PNG, WebP (≤ 5MB)
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
