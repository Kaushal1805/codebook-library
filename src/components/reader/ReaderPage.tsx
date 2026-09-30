import { BookPage } from "@/lib/data/bookContent";
import { ReaderSettingsState } from "./ReaderSettings";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReaderPageProps {
  page: BookPage;
  settings: ReaderSettingsState;
  isLastPreviewPage: boolean;
  onContinueReading: () => void;
  priceLabel: string;
}

export function ReaderPage({
  page,
  settings,
  isLastPreviewPage,
  onContinueReading,
  priceLabel,
}: ReaderPageProps) {
  // Font scale mapping
  const fontStyle = {
    sm: "text-sm leading-relaxed",
    md: "text-base leading-loose",
    lg: "text-lg leading-loose",
  }[settings.fontSize];

  // Zoom transform
  const zoomScale = settings.zoom / 100;

  return (
    <div
      className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12 md:py-16 transition-all duration-200 origin-top"
      style={{
        transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* Chapter header pill */}
      <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-3 text-xs font-mono text-muted-foreground">
        <span>Page {page.pageNumber}</span>
        <span className="hidden sm:inline-block truncate max-w-xs">{page.title}</span>
      </div>

      {/* Main Educational Article Content */}
      <article
        className={`reader-body ${fontStyle} space-y-5 transition-colors duration-200`}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Preview CTA Box on the final preview page (Page 3) */}
      {isLastPreviewPage && (
        <div className="mt-14 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent p-6 sm:p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Lock className="h-5 w-5" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            You've reached the end of the free preview.
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Unlock the remaining 7 modules—including complex Joins, CTEs, Window Functions, and real FAANG interview case studies.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={onContinueReading}
              className="w-full sm:w-auto h-11 px-6 font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-sm"
            >
              Continue Reading — {priceLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
