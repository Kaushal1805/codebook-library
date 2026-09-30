"use client";

import { useState } from "react";
import { Search, Sparkles, Lock, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChapterItem {
  pageNumber: number;
  title: string;
  isPreview: boolean;
}

interface ReaderSearchProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterItem[];
  currentPage: number;
  onSelectPage: (page: number) => void;
}

export function ReaderSearch({
  isOpen,
  onClose,
  chapters,
  currentPage,
  onSelectPage,
}: ReaderSearchProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      `page ${c.pageNumber}`.includes(query.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Table of contents & jump to page"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 md:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Search className="h-4 w-4 text-amber-accent" />
            <span>Contents & Page Navigation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters or type a page number..."
            className="pl-9 bg-muted/40 border-border/60 h-10 text-sm"
            autoFocus
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">
              No matching chapters or pages found.
            </p>
          ) : (
            filtered.map((item) => {
              const isCurrent = item.pageNumber === currentPage;
              return (
                <button
                  key={item.pageNumber}
                  type="button"
                  onClick={() => {
                    onSelectPage(item.pageNumber);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                    isCurrent
                      ? "bg-amber-accent/15 text-amber-500 font-semibold border border-amber-accent/30"
                      : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="flex h-5 w-6 items-center justify-center rounded bg-muted/80 text-[10px] font-mono shrink-0">
                      p.{item.pageNumber}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.isPreview ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-2.5 w-2.5" />
                        Preview
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <Lock className="h-2.5 w-2.5 opacity-60" />
                        Locked
                      </span>
                    )}
                    <ArrowRight className="h-3 w-3 opacity-40" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Pages 1–3 are included in the Free Preview.</span>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
