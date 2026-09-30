"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReaderSettingsState } from "./ReaderSettings";
import { LockedPage } from "./LockedPage";
import { Loader2, AlertCircle, RefreshCw, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: These measures reduce casual downloading/copying but cannot prevent screenshots or screen recording.

interface PdfViewerProps {
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  maxAllowedPages: number;
  settings: ReaderSettingsState;
  priceLabel: string;
  onTotalPagesDetected?: (pages: number) => void;
  onContinueReading: () => void;
  onUnlockClick: () => void;
  onGoToPage?: (page: number) => void;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export function PdfViewer({
  pdfUrl,
  currentPage,
  totalPages,
  maxAllowedPages,
  settings,
  priceLabel,
  onTotalPagesDetected,
  onContinueReading,
  onUnlockClick,
  onGoToPage,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [isPageEmpty, setIsPageEmpty] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Dynamically load PDF.js script from official CDN to prevent Turbopack worker compilation conflicts
  useEffect(() => {
    let isMounted = true;

    async function initPdfJs() {
      if (typeof window === "undefined") return;

      if (!window.pdfjsLib) {
        try {
          // Load pdf.js script
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PDF engine"));
            document.head.appendChild(script);
          });

          // Set worker src
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }
        } catch {
          if (isMounted) {
            setErrorMsg("Unable to load document reader engine. Please refresh and try again.");
            setIsLoadingPdf(false);
          }
          return;
        }
      }

      // Load the PDF document using signed URL
      try {
        setIsLoadingPdf(true);
        setErrorMsg(null);

        const loadingTask = window.pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(doc);
          setIsLoadingPdf(false);
          if (doc.numPages && onTotalPagesDetected) {
            onTotalPagesDetected(doc.numPages);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg("Unable to load this book right now. Please refresh and try again.");
          setIsLoadingPdf(false);
        }
      }
    }

    initPdfJs();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, onTotalPagesDetected]);

  // 2. Anti-Abuse Protections: intercept Save (Ctrl+S) and Print (Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Render Canvas Page (STRICT ACCESS CONTROL: Only if currentPage <= maxAllowedPages)
  const isPageLocked = currentPage > maxAllowedPages;

  const renderPage = useCallback(async () => {
    if (!pdfDoc || isPageLocked || !canvasRef.current) return;

    try {
      setIsRenderingPage(true);

      // Cancel any ongoing render task to avoid canvas state collision
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      // CRITICAL REQUIREMENT #6: Only fetch allowed preview page from PDF doc
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      // Calculate scale based on container width and zoom settings
      const zoomFactor = (settings.zoom || 100) / 100;
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Target comfortable reading width (~750px max width for desktop view)
      const containerWidth = Math.min(window.innerWidth - 48, 760);
      const baseScale = containerWidth / unscaledViewport.width;
      const finalScale = baseScale * zoomFactor;

      const viewport = page.getViewport({ scale: finalScale });

      // Support high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      // Check if page contains readable text or is blank flyleaf
      try {
        const textContent = await page.getTextContent();
        const hasText = textContent?.items && textContent.items.some((it: any) => it.str && it.str.trim().length > 0);
        setIsPageEmpty(!hasText);
      } catch {
        setIsPageEmpty(false);
      }

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      setIsRenderingPage(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        setIsRenderingPage(false);
      }
    }
  }, [pdfDoc, currentPage, isPageLocked, settings.zoom]);

  useEffect(() => {
    if (!isPageLocked && pdfDoc) {
      renderPage();
    }
  }, [renderPage, isPageLocked, pdfDoc, currentPage, settings.zoom]);

  // Window resize re-render
  useEffect(() => {
    const handleResize = () => {
      if (!isPageLocked && pdfDoc) {
        renderPage();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderPage, isPageLocked, pdfDoc]);

  // If page is beyond allowed preview limit, render LockedPage (ZERO paid content leak)
  if (isPageLocked) {
    return (
      <LockedPage
        priceLabel={priceLabel}
        currentPage={currentPage}
        totalPages={totalPages}
        onReturnToPreview={onContinueReading}
        onUnlockClick={onUnlockClick}
      />
    );
  }

  // Error State
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center max-w-md mx-auto space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">Document Loading Error</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{errorMsg}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-xs gap-1.5 h-8"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh & Try Again
        </Button>
      </div>
    );
  }

  // Loading State
  if (isLoadingPdf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-accent" />
        <p className="text-xs font-medium text-muted-foreground">
          Loading secure preview document...
        </p>
      </div>
    );
  }

  // Theme filter styling
  const themeFilterClass = {
    light: "",
    sepia: "sepia-[.25] contrast-[.95]",
    dark: "invert-[.9] hue-rotate-180 contrast-[1.1]",
  }[settings.theme || "dark"];

  return (
    <div
      className="flex flex-col items-center justify-center py-6 sm:py-10 select-none"
      onContextMenu={(e) => e.preventDefault()} // Anti-abuse: Disable right-click context menu
    >
      {/* Page Header Indicator */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[760px] px-2 text-[11px] font-mono text-muted-foreground">
        <span>Page {currentPage} of {totalPages}</span>
        <span className="text-amber-500 font-medium">Free Preview ({maxAllowedPages} pages)</span>
      </div>

      {/* Canvas Wrapper */}
      <div className="relative flex justify-center shadow-lg rounded-sm overflow-hidden border border-border/60 bg-white">
        {isRenderingPage && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-10">
            <Loader2 className="h-6 w-6 animate-spin text-amber-accent" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`block max-w-full transition-all duration-200 ${themeFilterClass}`}
        />

        {/* Informative overlay when Page 1 of the PDF is a blank flyleaf/cover placeholder */}
        {isPageEmpty && currentPage === 1 && !isRenderingPage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-card/95 backdrop-blur-md z-10 space-y-4">
            <div className="rounded-2xl bg-amber-500/10 p-4 text-amber-500 border border-amber-500/20 shadow-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-semibold border border-amber-500/20">
                Book Cover / Flyleaf Page
              </span>
              <h3 className="text-lg font-bold text-foreground">
                First Page of Document
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Page 1 in this PDF document is an initial flyleaf placeholder. Chapter 1 and the full readable content starts on <strong>Page 2</strong>.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onGoToPage?.(2)}
              className="h-10 px-5 text-xs font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-sm gap-2"
            >
              <span>Start Reading Page 2</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* End of Preview note on last preview page */}
      {currentPage === maxAllowedPages && (
        <div className="mt-8 text-center max-w-md p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
          <p className="text-xs font-semibold text-foreground">
            You've reached the end of the free preview ({maxAllowedPages} of {totalPages} pages).
          </p>
          <Button
            size="sm"
            onClick={onUnlockClick}
            className="h-8 text-xs bg-amber-accent text-black hover:bg-amber-accent-hover font-semibold"
          >
            Unlock the complete book ({priceLabel})
          </Button>
        </div>
      )}
    </div>
  );
}
