import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
  previewPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ReadingProgress({
  currentPage,
  totalPages,
  previewPages,
  onPrev,
  onNext,
}: ReadingProgressProps) {
  // Overall book progress percentage
  const totalProgress = Math.min(
    100,
    Math.round((currentPage / totalPages) * 100)
  );

  const isLocked = currentPage > previewPages;

  return (
    <nav
      aria-label="Reader bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 pb-safe supports-[backdrop-filter]:bg-background/80 transition-colors duration-200"
    >
      {/* Top micro progress bar */}
      <div
        role="progressbar"
        aria-valuenow={totalProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        className="h-1 w-full bg-muted/60 relative overflow-hidden"
      >
        <div
          className={`h-full transition-all duration-300 ease-out ${
            isLocked ? "bg-muted-foreground" : "bg-amber-accent"
          }`}
          style={{ width: `${totalProgress}%` }}
        />
        {/* Visual tick mark at preview boundary */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500/50"
          style={{ left: `${(previewPages / totalPages) * 100}%` }}
          title={`End of free preview (Page ${previewPages})`}
        />
      </div>

      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 max-w-4xl mx-auto">
        {/* Previous Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all touch-manipulation"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="mr-1 sm:mr-1.5 h-4 w-4" />
          <span>Previous</span>
        </Button>

        {/* Center: Page indicator */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wide text-foreground tabular-nums">
            <span>Page {currentPage} of {totalPages}</span>
            {isLocked && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground hidden xs:inline-block">
            {isLocked
              ? "Full Edition"
              : `Preview: ${currentPage} of ${previewPages}`}
          </span>
        </div>

        {/* Next Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all touch-manipulation"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="ml-1 sm:ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
