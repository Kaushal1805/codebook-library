"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Lock, Sparkles } from "lucide-react";

interface ChapterDetail {
  number: string;
  title: string;
  subtopics: string[];
  duration: string;
  isPreview: boolean;
}

const defaultChapterDetails: Record<string, ChapterDetail> = {
  "01 — SQL Fundamentals": {
    number: "01",
    title: "SQL Fundamentals",
    duration: "15 min read",
    isPreview: true,
    subtopics: [
      "Relational database concepts & ACID properties",
      "Logical Query Processing Lifecycle (FROM -> WHERE -> SELECT)",
      "Standard SQL dialect differences (Postgres, MySQL, Snowflake)",
      "Essential data types, casting, and NULL fundamentals"
    ]
  },
  "02 — Filtering and Aggregation": {
    number: "02",
    title: "Filtering and Aggregation",
    duration: "20 min read",
    isPreview: true,
    subtopics: [
      "WHERE clause optimization and predicate pushdown",
      "GROUP BY nuances and multi-column grouping",
      "HAVING vs WHERE: Performance and syntax distinctions",
      "Aggregate functions: COUNT(1) vs COUNT(*) vs COUNT(col)"
    ]
  },
  "03 — Joins": {
    number: "03",
    title: "Joins",
    duration: "25 min read",
    isPreview: true,
    subtopics: [
      "INNER, LEFT, RIGHT, and FULL OUTER joins deep dive",
      "Self joins and Cross joins in interview scenarios",
      "Anti-joins: NOT EXISTS vs LEFT JOIN / IS NULL",
      "Join performance: Hash joins vs Merge joins vs Nested loops"
    ]
  },
  "04 — Subqueries": {
    number: "04",
    title: "Subqueries",
    duration: "20 min read",
    isPreview: false,
    subtopics: [
      "Scalar, column, and table-valued subqueries",
      "Correlated subqueries and execution implications",
      "IN vs EXISTS vs ANY/ALL operator mechanics",
      "Rewriting slow subqueries into performant joins"
    ]
  },
  "05 — CTEs": {
    number: "05",
    title: "CTEs",
    duration: "22 min read",
    isPreview: false,
    subtopics: [
      "Standard Common Table Expressions (WITH clause)",
      "Recursive CTEs for hierarchical & tree data structures",
      "CTE materialization strategies in modern SQL engines",
      "Structuring clean, maintainable analytical pipelines"
    ]
  },
  "06 — Window Functions": {
    number: "06",
    title: "Window Functions",
    duration: "30 min read",
    isPreview: false,
    subtopics: [
      "PARTITION BY and ORDER BY clause mechanics",
      "Ranking functions: ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE()",
      "Offset functions: LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE()",
      "Running totals and moving averages with ROWS BETWEEN frames"
    ]
  },
  "07 — Interview Questions": {
    number: "07",
    title: "Interview Questions",
    duration: "35 min read",
    isPreview: false,
    subtopics: [
      "Top 15 high-frequency FAANG technical screening queries",
      "Detecting consecutive streaks and gaps & islands problems",
      "Second highest salary & Nth percentile queries",
      "Common candidate traps and how interviewers grade your answers"
    ]
  },
  "08 — SQL Case Studies": {
    number: "08",
    title: "SQL Case Studies",
    duration: "40 min read",
    isPreview: false,
    subtopics: [
      "E-commerce 30-day user retention & cohort matrix calculation",
      "Financial churn prediction and subscription MRR tracking",
      "Ad-click attribution modeling with sessionization logic",
      "End-to-end multi-table reporting with query optimization review"
    ]
  }
};

interface TableOfContentsProps {
  chapters: string[];
}

export function TableOfContents({ chapters }: TableOfContentsProps) {
  // Initially expand the first chapter
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

  const toggleChapter = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpandedIndices(chapters.map((_, i) => i));
  };

  const collapseAll = () => {
    setExpandedIndices([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {chapters.length} comprehensive modules
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-medium text-amber-accent hover:underline focus:outline-none"
          >
            Expand all
          </button>
          <span className="text-muted-foreground/40">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        {chapters.map((chapterStr, idx) => {
          const isExpanded = expandedIndices.includes(idx);
          const detail = defaultChapterDetails[chapterStr] || {
            number: String(idx + 1).padStart(2, "0"),
            title: chapterStr.replace(/^\d+\s*[—–-]\s*/, ""),
            duration: "20 min read",
            isPreview: idx < 3,
            subtopics: [
              "Core conceptual definitions and principles",
              "Realistic database query patterns",
              "Common interview challenges and pitfalls"
            ]
          };

          return (
            <div key={idx} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleChapter(idx)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono font-medium text-foreground/80">
                    {detail.number}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate block">
                      {detail.title}
                    </span>
                    <span className="text-xs text-muted-foreground sm:hidden mt-0.5 block">
                      {detail.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {detail.isPreview ? (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      Free Preview
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Lock className="h-3 w-3 opacity-60" />
                      Full Edition
                    </span>
                  )}

                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    {detail.duration}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/30 bg-muted/15 px-5 py-3.5 sm:pl-16">
                  <p className="text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
                    Topics covered:
                  </p>
                  <ul className="space-y-1.5">
                    {detail.subtopics.map((subtopic, sIdx) => (
                      <li
                        key={sIdx}
                        className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-accent shrink-0 mt-1.5" />
                        <span>{subtopic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
