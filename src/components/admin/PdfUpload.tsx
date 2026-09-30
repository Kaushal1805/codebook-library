"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Lock,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractDataFromPdfFile, ExtractedPdfData } from "@/lib/pdf/extractor";

interface PdfUploadProps {
  initialPdfPath?: string;
  initialPdfName?: string;
  initialPdfSize?: number;
  onPdfChange: (pdfMeta: {
    pdfPath: string;
    pdfFileName: string;
    pdfFileSize: number;
    extractedPageCount?: number;
  }) => void;
  onAutoExtracted?: (extracted: ExtractedPdfData, uploadedCoverUrl?: string) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadFileLocally(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/upload-pdf", { method: "POST", body: formData });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || "Unable to save file locally");
  }
  return { path: result.pdfPath, fileName: file.name, fileSize: file.size };
}

export function PdfUpload({
  initialPdfPath = "",
  initialPdfName = "",
  initialPdfSize = 0,
  onPdfChange,
  onAutoExtracted,
}: PdfUploadProps) {
  const [pdfPath, setPdfPath] = useState(initialPdfPath);
  const [pdfFileName, setPdfFileName] = useState(initialPdfName);
  const [pdfFileSize, setPdfFileSize] = useState(initialPdfSize);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractingStep, setExtractingStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [extractedSummary, setExtractedSummary] = useState<ExtractedPdfData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = 80 * 1024 * 1024; // 80MB limit

  const handleFile = async (file: File) => {
    setErrorMsg("");

    // 1. Validate file size
    if (file.size > maxSizeBytes) {
      setErrorMsg("File is too large. Maximum size is 80MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setExtractingStep("Reading book document & extracting contents...");

    try {
      // Step A: Extract full real text, table of contents, and pages from document
      let extractedData: ExtractedPdfData | null = null;
      let uploadedCoverUrl: string | undefined = undefined;

      try {
        extractedData = await extractDataFromPdfFile(file, (step, percent) => {
          setExtractingStep(step);
          setUploadProgress(Math.min(percent, 75));
        });

        if (extractedData) {
          setExtractedSummary(extractedData);
          setDetectedPages(extractedData.pageCount);

          // If cover was rendered from Page 1, upload to Supabase if configured
          if (extractedData.coverBlob) {
            try {
              const supabase = createClient();
              const coverFileName = `covers/auto-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
              const { data: coverUploadData, error: coverError } = await supabase.storage
                .from("book-covers")
                .upload(coverFileName, extractedData.coverBlob, {
                  contentType: "image/jpeg",
                  cacheControl: "3600",
                  upsert: true,
                });

              if (!coverError && coverUploadData) {
                const { data: publicUrlData } = supabase.storage
                  .from("book-covers")
                  .getPublicUrl(coverUploadData.path);
                uploadedCoverUrl = publicUrlData?.publicUrl;
              }
            } catch (coverErr) {
              console.warn("Cover upload note:", coverErr);
            }
          }
        }
      } catch (extractErr) {
        console.warn("Document extraction warning:", extractErr);
      }

      setUploadProgress(80);
      setExtractingStep("Storing book document file...");

      // Step B: Save the physical file on server
      let finalPath = "";
      try {
        const localRes = await uploadFileLocally(file);
        finalPath = localRes.path;
      } catch (uploadErr) {
        console.warn("Local upload error, trying Supabase storage:", uploadErr);
        // Try Supabase Storage if local failed
        const supabase = createClient();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `pdfs/${Date.now()}-${cleanFileName}`;
        const { data, error } = await supabase.storage
          .from("book-pdfs")
          .upload(storagePath, file, { cacheControl: "3600", upsert: false });

        if (error || !data?.path) {
          throw new Error("Could not store file on server.");
        }
        finalPath = data.path;
      }

      setPdfPath(finalPath);
      setPdfFileName(file.name);
      setPdfFileSize(file.size);

      // Notify parent of PDF file metadata
      onPdfChange({
        pdfPath: finalPath,
        pdfFileName: file.name,
        pdfFileSize: file.size,
        extractedPageCount: extractedData?.pageCount,
      });

      // Notify parent with extracted data for automated form fill & real page persistence
      if (extractedData && onAutoExtracted) {
        onAutoExtracted(extractedData, uploadedCoverUrl);
      }

      setUploadProgress(100);
      setExtractingStep("Done! Real book contents loaded.");
    } catch (err: any) {
      console.error("Document upload error:", err);
      setErrorMsg(err?.message || "Failed to process the book document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPdfPath("");
    setPdfFileName("");
    setPdfFileSize(0);
    setDetectedPages(null);
    setExtractedSummary(null);
    onPdfChange({
      pdfPath: "",
      pdfFileName: "",
      pdfFileSize: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Book Document & Content Extractor
          </label>
          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20">
            <Lock className="h-2.5 w-2.5" />
            SECURE STORAGE
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">PDF, DOCX, TXT, MD up to 80MB</span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {pdfPath ? (
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 shadow-xs">
                <FileText className="h-6 w-6" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate max-w-sm">
                    {pdfFileName || "Book Document"}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                    {formatFileSize(pdfFileSize)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    File Uploaded & Saved
                  </span>
                  {detectedPages && (
                    <span className="text-amber-500 font-semibold">
                      • {detectedPages} Pages Extracted
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Replace Document
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {extractedSummary && (
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Real Content Extracted ({extractedSummary.pages.length} Pages):</span>
                </div>
                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Exact text synced to reader
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <div>
                  <span className="text-foreground font-medium">Title:</span> {extractedSummary.title}
                </div>
                <div>
                  <span className="text-foreground font-medium">Author:</span> {extractedSummary.author}
                </div>
                <div>
                  <span className="text-foreground font-medium">Category:</span> {extractedSummary.category}
                </div>
                <div>
                  <span className="text-foreground font-medium">Pages:</span> {extractedSummary.pageCount}
                </div>
              </div>

              {extractedSummary.tableOfContents.length > 0 && (
                <div className="pt-1 text-[11px]">
                  <span className="text-foreground font-medium block mb-1">Detected Chapters / Questions:</span>
                  <div className="flex flex-wrap gap-1">
                    {extractedSummary.tableOfContents.slice(0, 4).map((toc, idx) => (
                      <span key={idx} className="bg-background/80 border border-border/60 px-2 py-0.5 rounded text-[10px] text-muted-foreground truncate max-w-[220px]">
                        {toc}
                      </span>
                    ))}
                    {extractedSummary.tableOfContents.length > 4 && (
                      <span className="text-[10px] text-muted-foreground/80 self-center">
                        +{extractedSummary.tableOfContents.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 hover:border-amber-500/60 bg-muted/10 hover:bg-muted/25 p-8 text-center cursor-pointer transition-all duration-200"
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="relative flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                <Sparkles className="h-4 w-4 text-amber-500 absolute" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-foreground">
                  {extractingStep || "Extracting real book contents..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Progress: {uploadProgress}% (Extracting exact pages, TOC & saving document)
                </p>
              </div>
              <div className="w-56 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 group-hover:bg-amber-500/20 mb-3 transition-all">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-foreground">
                Drop your Book (PDF, DOCX, TXT, MD) here, or <span className="text-amber-500 underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
                Extracts exact page content, headings, questions, and page-by-page text so your real book appears directly in the reader.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-muted-foreground/80">
                <span className="flex items-center gap-1 bg-background/80 px-2 py-0.5 rounded border border-border/60">
                  <BookOpen className="h-2.5 w-2.5 text-amber-500" /> Exact Page Sync
                </span>
                <span className="flex items-center gap-1 bg-background/80 px-2 py-0.5 rounded border border-border/60">
                  <Sparkles className="h-2.5 w-2.5 text-amber-500" /> Auto-Fill All Fields
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf,.docx,.doc,.txt,.md"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
