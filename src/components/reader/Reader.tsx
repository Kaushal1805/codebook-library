"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Book, formatBookPrice } from "@/lib/data/books";
import { PreviewData } from "@/lib/data/bookContent";
import { getBookmarks, addBookmark, removeBookmark } from "@/lib/data/bookmarks";
import { getReadingProgress, updateReadingProgress } from "@/lib/data/progress";
import { createClient } from "@/lib/supabase/client";
import { ReaderToolbar } from "./ReaderToolbar";
import { ReaderPage } from "./ReaderPage";
import { ReadingProgress } from "./ReadingProgress";
import { LockedPage } from "./LockedPage";
import { ReaderSearch } from "./ReaderSearch";
import { ReaderSettingsState } from "./ReaderSettings";
import { PdfViewer } from "./PdfViewer";
import { AlertCircle, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

// Note: These measures reduce casual downloading/copying but cannot prevent screenshots or screen recording.

interface ReaderProps {
  book: Book;
  previewData: PreviewData;
  isPurchased?: boolean;
}

interface PdfPreviewInfo {
  signedUrl: string;
  maxAllowedPages: number;
  totalPages: number;
  title: string;
  isPurchased?: boolean;
}

export function Reader({ book, previewData, isPurchased = false }: ReaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ReaderSettingsState>({
    theme: "dark",
    fontSize: "md",
    zoom: 100,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"info" | "success">("info");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // PDF Engine State (Day 6 & Day 7)
  const [pdfPreviewInfo, setPdfPreviewInfo] = useState<PdfPreviewInfo | null>(null);
  const [isLoadingPdfInfo, setIsLoadingPdfInfo] = useState(Boolean(book.pdfPath));
  const [detectedTotalPages, setDetectedTotalPages] = useState<number>(
    book.pageCount || previewData.totalPages
  );

  const [purchasedState, setPurchasedState] = useState(Boolean(isPurchased));
  const hasPurchasedAccess = Boolean(purchasedState || isPurchased || pdfPreviewInfo?.isPurchased);
  const priceLabel = formatBookPrice(book);
  const effectiveTotalPages =
    detectedTotalPages || pdfPreviewInfo?.totalPages || previewData.totalPages || 10;
  const effectivePreviewPages = hasPurchasedAccess
    ? effectiveTotalPages
    : pdfPreviewInfo?.maxAllowedPages || book.freePreviewPages || previewData.previewPages || 3;

  const showToast = useCallback((msg: string, type: "info" | "success" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Fetch Signed URL from server endpoint if book has uploaded PDF
  useEffect(() => {
    if (!book.pdfPath) {
      setIsLoadingPdfInfo(false);
      return;
    }

    async function fetchSignedPdfUrl() {
      try {
        setIsLoadingPdfInfo(true);
        const res = await fetch(`/api/books/${book.slug}/pdf-preview-url`);
        if (res.ok) {
          const data: PdfPreviewInfo = await res.json();
          setPdfPreviewInfo(data);
          if (data.totalPages) {
            setDetectedTotalPages(data.totalPages);
          }
        } else {
          // If signed URL fetch fails or no PDF, fallback to educational preview
          setPdfPreviewInfo(null);
        }
      } catch {
        setPdfPreviewInfo(null);
      } finally {
        setIsLoadingPdfInfo(false);
      }
    }

    fetchSignedPdfUrl();
  }, [book.pdfPath, book.slug]);

  // 2. Hydrate state from localStorage and Supabase on mount
  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();

    // Restore from localStorage
    try {
      const savedProgress = localStorage.getItem(`reader_progress_${book.slug}`);
      if (savedProgress) {
        const pageNum = Number(savedProgress);
        if (pageNum >= 1 && pageNum <= effectiveTotalPages) {
          setCurrentPage(pageNum);
        }
      }
    } catch {
      // Ignore
    }

    try {
      const savedBookmarks = localStorage.getItem(`reader_bookmarks_${book.slug}`);
      if (savedBookmarks) {
        setBookmarkedPages(JSON.parse(savedBookmarks));
      }
    } catch {
      // Ignore
    }

    try {
      const savedSettings = localStorage.getItem("reader_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch {
      // Ignore
    }

    // Preload checkout script (0ms latency on click)
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Authenticated sync with Supabase
    async function syncAuthData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);

          const remotePage = await getReadingProgress(user.id, book.id, supabase);
          if (remotePage && remotePage >= 1 && remotePage <= effectiveTotalPages) {
            setCurrentPage(remotePage);
            localStorage.setItem(`reader_progress_${book.slug}`, remotePage.toString());
          }

          const remoteBookmarks = await getBookmarks(user.id, book.id, supabase);
          if (remoteBookmarks && remoteBookmarks.length > 0) {
            setBookmarkedPages(remoteBookmarks);
            localStorage.setItem(`reader_bookmarks_${book.slug}`, JSON.stringify(remoteBookmarks));
          }
        }
      } catch {
        // Fallback on local storage
      }
    }

    syncAuthData();
  }, [book.id, book.slug, effectiveTotalPages]);

  const updateSettings = (newSettings: Partial<ReaderSettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("reader_settings", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= effectiveTotalPages) {
        setCurrentPage(page);
        try {
          localStorage.setItem(`reader_progress_${book.slug}`, page.toString());
        } catch {
          // Ignore
        }

        if (userId) {
          const supabase = createClient();
          const progressPercent = Math.min(
            100,
            Math.round((page / effectiveTotalPages) * 100)
          );
          updateReadingProgress(userId, book.id, page, progressPercent, supabase).catch(() => {});
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [book.id, book.slug, effectiveTotalPages, userId]
  );

  const toggleBookmark = () => {
    const isBookmarked = bookmarkedPages.includes(currentPage);
    const updated = isBookmarked
      ? bookmarkedPages.filter((p) => p !== currentPage)
      : [...bookmarkedPages, currentPage].sort((a, b) => a - b);

    setBookmarkedPages(updated);

    try {
      localStorage.setItem(`reader_bookmarks_${book.slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (userId) {
      const supabase = createClient();
      if (isBookmarked) {
        removeBookmark(userId, book.id, currentPage, supabase).catch(() => {});
        showToast(`Removed bookmark for Page ${currentPage}`, "info");
      } else {
        const pageTitle =
          previewData.chapterList.find((c) => c.pageNumber === currentPage)?.title ||
          `Page ${currentPage}`;
        addBookmark(userId, book.id, currentPage, pageTitle, supabase).catch(() => {});
        showToast("Page bookmarked", "success");
      }
    } else {
      if (isBookmarked) {
        showToast(`Removed bookmark for Page ${currentPage}`, "info");
      } else {
        showToast("Page bookmarked", "success");
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isSearchOpen
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        goToPage(currentPage - 1);
      } else if (e.key === "ArrowRight") {
        goToPage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goToPage, isSearchOpen]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        if (window.Razorpay) return resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUnlockClick = async () => {
    try {
      showToast("Initializing secure Razorpay checkout...", "info");
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        if (orderData?.alreadyPurchased) {
          setPurchasedState(true);
          showToast("Book is already unlocked!", "success");
          return;
        }
        throw new Error(orderData?.error || "Failed to create order");
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout. Please check your connection.");
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CodeBook Library",
        description: `Unlock Full Book: ${orderData.bookTitle}`,
        order_id: orderData.orderId,
        image: orderData.bookCover || undefined,
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                book_id: book.id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPurchasedState(true);
              // Also refresh pdf preview info if PDF is loaded
              fetch(`/api/books/${book.slug}/pdf-preview-url`)
                .then((r) => r.ok && r.json())
                .then((d) => d && setPdfPreviewInfo(d))
                .catch(() => {});
              showToast("🎉 Payment Successful! Complete book is now unlocked.", "success");
            } else {
              showToast(verifyData?.error || "Payment verification failed.", "info");
            }
          } catch {
            showToast("Network error during verification.", "info");
          }
        },
        modal: {
          ondismiss: function () {
            showToast("Payment checkout cancelled.", "info");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        showToast(response.error?.description || "Payment failed. Please try again.", "info");
      });
      rzp.open();
    } catch (err: any) {
      showToast(err?.message || "Failed to launch payment checkout.", "info");
    }
  };

  const handleContinueReadingFromPreviewEnd = () => {
    goToPage(effectivePreviewPages + 1);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-accent border-t-transparent" />
      </div>
    );
  }

  const isBookmarked = bookmarkedPages.includes(currentPage);
  const isPreviewLimitExceeded = currentPage > effectivePreviewPages;
  const pageData = !isPreviewLimitExceeded
    ? previewData.pages.find((p) => p.pageNumber === currentPage)
    : null;

  const themeClasses = {
    light: "bg-[#fdfdfc] text-zinc-900 reader-theme-light",
    dark: "bg-[#0c0c0e] text-zinc-200 reader-theme-dark",
    sepia: "bg-[#f5efe6] text-[#453725] reader-theme-sepia",
  }[settings.theme];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${themeClasses}`}
      onContextMenu={(e) => e.preventDefault()} // Anti-Abuse: Prevent context menu
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border/80 bg-popover px-4 py-2 text-xs font-medium text-popover-foreground shadow-lg transition-all animate-in fade-in slide-in-from-top-2"
        >
          {toastType === "success" ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Toolbar */}
      <ReaderToolbar
        bookTitle={book.title}
        bookSlug={book.slug}
        currentPage={currentPage}
        totalPages={effectiveTotalPages}
        previewPages={effectivePreviewPages}
        isBookmarked={isBookmarked}
        toggleBookmark={toggleBookmark}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
        updateSettings={updateSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        {isLoadingPdfInfo ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-amber-accent" />
            <p className="text-xs text-muted-foreground font-medium">
              Initializing document reader...
            </p>
          </div>
        ) : pdfPreviewInfo ? (
          /* Real Browser-Based PDF.js Canvas Reader (Day 6) */
          <PdfViewer
            pdfUrl={pdfPreviewInfo.signedUrl}
            currentPage={currentPage}
            totalPages={effectiveTotalPages}
            maxAllowedPages={pdfPreviewInfo.maxAllowedPages}
            settings={settings}
            priceLabel={priceLabel}
            onTotalPagesDetected={(pages) => setDetectedTotalPages(pages)}
            onContinueReading={() => goToPage(effectivePreviewPages)}
            onUnlockClick={handleUnlockClick}
            onGoToPage={goToPage}
          />
        ) : isPreviewLimitExceeded ? (
          /* Gated Locked State (ZERO paid bytes rendered into DOM) */
          <LockedPage
            priceLabel={priceLabel}
            currentPage={currentPage}
            totalPages={effectiveTotalPages}
            onReturnToPreview={() => goToPage(effectivePreviewPages)}
            onUnlockClick={handleUnlockClick}
          />
        ) : pageData ? (
          /* Educational Preview Content Fallback for Demo Books */
          <ReaderPage
            page={pageData}
            settings={settings}
            isLastPreviewPage={currentPage === effectivePreviewPages}
            onContinueReading={handleContinueReadingFromPreviewEnd}
            priceLabel={priceLabel}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Page not found.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              The requested page number does not exist for this book preview.
            </p>
            <Link
              href={`/books/${book.slug}`}
              className={buttonVariants({
                variant: "outline",
                className: "h-10 px-5",
              })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Book
            </Link>
          </div>
        )}
      </main>

      {/* Bottom Reading Navigation & Progress Bar */}
      <ReadingProgress
        currentPage={currentPage}
        totalPages={effectiveTotalPages}
        previewPages={effectivePreviewPages}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
      />

      {/* Search & Jump Modal */}
      <ReaderSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chapters={previewData.chapterList}
        currentPage={currentPage}
        onSelectPage={goToPage}
      />
    </div>
  );
}
