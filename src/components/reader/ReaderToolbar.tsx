import Link from "next/link";
import { ArrowLeft, Bookmark, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReaderSettingsDropdown, ReaderSettingsState } from "./ReaderSettings";

interface ReaderToolbarProps {
  bookTitle: string;
  bookSlug: string;
  currentPage: number;
  totalPages: number;
  previewPages: number;
  isBookmarked: boolean;
  toggleBookmark: () => void;
  onOpenSearch: () => void;
  settings: ReaderSettingsState;
  updateSettings: (newSettings: Partial<ReaderSettingsState>) => void;
}

export function ReaderToolbar({
  bookTitle,
  bookSlug,
  currentPage,
  totalPages,
  previewPages,
  isBookmarked,
  toggleBookmark,
  onOpenSearch,
  settings,
  updateSettings,
}: ReaderToolbarProps) {
  // Preview progress percentage calculation
  const previewProgress = Math.min(
    100,
    Math.round((currentPage / previewPages) * 100)
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-colors duration-200">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 max-w-5xl mx-auto">
        {/* Left: Back to Book + Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
          <Link
            href={`/books/${bookSlug}`}
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 -ml-1 text-muted-foreground hover:text-foreground shrink-0",
            })}
            aria-label="Back to Book Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {bookTitle}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center font-medium uppercase tracking-wider text-amber-500">
                Free Preview
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span className="hidden sm:inline">
                {currentPage <= previewPages
                  ? `Preview ${previewProgress}% (Page ${currentPage} of ${previewPages})`
                  : `Page ${currentPage} of ${totalPages} (Locked)`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search, Bookmark, Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Progress pill on mobile/tablet */}
          <div className="hidden md:flex items-center bg-muted/60 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground mr-1 border border-border/40">
            <span className="tabular-nums">
              {currentPage <= previewPages
                ? `${previewProgress}% preview`
                : `Locked`}
            </span>
          </div>

          {/* Search Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={onOpenSearch}
            aria-label="Search contents & chapters"
            title="Search chapters (or jump to page)"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Bookmark Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 transition-colors ${
              isBookmarked
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this page"}
            title={isBookmarked ? "Bookmarked (Click to remove)" : "Bookmark this page"}
          >
            <Bookmark
              className={`h-4 w-4 transition-all ${
                isBookmarked ? "fill-amber-500" : ""
              }`}
            />
          </Button>

          {/* Settings Dropdown */}
          <ReaderSettingsDropdown
            settings={settings}
            updateSettings={updateSettings}
          />
        </div>
      </div>
    </header>
  );
}
