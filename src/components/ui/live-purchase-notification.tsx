"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, X, Sparkles, ShoppingBag } from "lucide-react";

interface NotificationItem {
  id: string;
  name: string;
  location: string;
  action: string;
  bookTitle: string;
  bookSlug: string;
  timeAgo: string;
  coverColor: string;
  coverAccent: string;
}

const RECENT_PURCHASES: NotificationItem[] = [
  {
    id: "p1",
    name: "Aarav Sharma",
    location: "Bengaluru",
    action: "purchased",
    bookTitle: "SQL Interview Mastery",
    bookSlug: "sql-interview-mastery",
    timeAgo: "2 mins ago",
    coverColor: "#0f172a",
    coverAccent: "#38bdf8",
  },
  {
    id: "p2",
    name: "Priya Kulkarni",
    location: "Pune",
    action: "purchased",
    bookTitle: "200 DSA Interview Questions - Data Science & Data Analyst",
    bookSlug: "200-dsa-interview-questions-data-science-data-analyst",
    timeAgo: "4 mins ago",
    coverColor: "#1e293b",
    coverAccent: "#f59e0b",
  },
  {
    id: "p3",
    name: "Rohan Varma",
    location: "Hyderabad",
    action: "unlocked",
    bookTitle: "200 SQL Important Questions",
    bookSlug: "200-sql-important-questions",
    timeAgo: "6 mins ago",
    coverColor: "#0f172a",
    coverAccent: "#38bdf8",
  },
  {
    id: "p4",
    name: "Sneha Patel",
    location: "Mumbai",
    action: "purchased",
    bookTitle: "LangChain Practical Guide",
    bookSlug: "langchain-practical-guide",
    timeAgo: "9 mins ago",
    coverColor: "#064e3b",
    coverAccent: "#34d399",
  },
  {
    id: "p5",
    name: "Vikram Malhotra",
    location: "Gurugram",
    action: "started reading",
    bookTitle: "Python Interview Questions",
    bookSlug: "python-interview-questions",
    timeAgo: "12 mins ago",
    coverColor: "#172554",
    coverAccent: "#60a5fa",
  },
  {
    id: "p6",
    name: "Ananya Gupta",
    location: "Noida",
    action: "purchased",
    bookTitle: "Data Analyst Interview Handbook",
    bookSlug: "data-analyst-interview-handbook",
    timeAgo: "15 mins ago",
    coverColor: "#312e81",
    coverAccent: "#a5b4fc",
  },
  {
    id: "p7",
    name: "Aditya Nair",
    location: "Chennai",
    action: "purchased",
    bookTitle: "Machine Learning Interview Guide",
    bookSlug: "machine-learning-interview-guide",
    timeAgo: "18 mins ago",
    coverColor: "#4c0519",
    coverAccent: "#fb7185",
  },
];

export function LivePurchaseNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial delay before first popup
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    // Interval to cycle notifications
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_PURCHASES.length);
        setIsVisible(true);
      }, 800);
    }, 9000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = RECENT_PURCHASES[currentIndex];

  return (
    <div
      className={`fixed bottom-5 left-5 z-50 max-w-sm transition-all duration-500 transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center gap-3.5 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-2xl backdrop-blur-xl hover:border-amber-500/40 transition-colors">
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border/80 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          title="Dismiss notification"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Mini Book Icon / Thumbnail */}
        <Link
          href={`/books/${current.bookSlug}`}
          className="relative flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 shadow-sm overflow-hidden"
          style={{ backgroundColor: current.coverColor }}
        >
          <div className="text-[8px] font-bold text-center px-0.5 leading-tight font-mono opacity-90" style={{ color: current.coverAccent }}>
            PDF
          </div>
          <div className="absolute inset-y-0 left-0 w-1 bg-black/40" />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground truncate">
              {current.name}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              ({current.location})
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            <span className="text-amber-400 font-medium">{current.action}</span>{" "}
            <Link
              href={`/books/${current.bookSlug}`}
              className="text-foreground hover:text-amber-400 underline transition-colors font-medium"
            >
              {current.bookTitle}
            </Link>
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
            <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Verified
            </span>
            <span>&bull;</span>
            <span>{current.timeAgo}</span>
          </div>
        </div>

        {/* Icon */}
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShoppingBag className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
