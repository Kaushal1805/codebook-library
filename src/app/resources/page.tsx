import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FileText, Download, BookOpen, Sparkles, CheckCircle2, ArrowRight, Code2, Database, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Free Resources & Cheat Sheets — CodeBook Library",
  description: "Download free developer cheat sheets, sample interview questions, and starter PDF guides.",
};

const CHEAT_SHEETS = [
  {
    id: "cs1",
    title: "SQL Window Functions Cheat Sheet",
    category: "SQL",
    icon: Database,
    color: "#38bdf8",
    bg: "#0f172a",
    description: "Quick reference guide for ROW_NUMBER, RANK, DENSE_RANK, NTILE, and LAG/LEAD partition frames.",
    pages: "4 pages",
    format: "PDF Quick Sheet",
    slug: "sql-interview-mastery",
  },
  {
    id: "cs2",
    title: "Top 50 Python Interview Q&A Summary",
    category: "Python",
    icon: Code2,
    color: "#f59e0b",
    bg: "#1e293b",
    description: "Handy revision sheet covering Python GIL, generators, list comprehensions, decorators, and memory allocation.",
    pages: "6 pages",
    format: "PDF Summary",
    slug: "python-interview-questions",
  },
  {
    id: "cs3",
    title: "Pandas Data Manipulation Quick Ref",
    category: "Data Analytics",
    icon: Terminal,
    color: "#34d399",
    bg: "#064e3b",
    description: "Essential Pandas idioms for groupby, pivot_table, merge, melt, and handling missing data.",
    pages: "5 pages",
    format: "Cheatsheet",
    slug: "pandas-interview-guide",
  },
  {
    id: "cs4",
    title: "GenAI & RAG Architecture Mindmap",
    category: "GenAI",
    icon: Sparkles,
    color: "#a5b4fc",
    bg: "#312e81",
    description: "Visual roadmap covering chunking strategies, embedding models, vector databases, and re-ranking pipelines.",
    pages: "3 pages",
    format: "Visual Architecture",
    slug: "rag-from-basics-to-production",
  },
];

const FREE_BOOKS = [
  {
    title: "200 SQL Interview Questions (Free Edition)",
    author: "Sarah Chen",
    slug: "200-sql-interview-questions",
    description: "Complete 180-page interview question bank available completely free to read online.",
    badge: "100% Free",
  },
  {
    title: "Python Interview Questions (Free Reader Edition)",
    author: "David Kumar",
    slug: "python-interview-questions",
    description: "Comprehensive collection of fundamental and intermediate Python interview questions.",
    badge: "Free Online Access",
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: "Free Resources", href: "/resources" }]} />

      {/* Header */}
      <div className="mt-6 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Community Learning Vault</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          Free Developer Resources & Cheat Sheets
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl">
          Downloadable cheat sheets, architectural mindmaps, and free digital interview handbooks
          to accelerate your technical preparation.
        </p>
      </div>

      {/* Free Books Callout Grid */}
      <div className="mb-14">
        <h2 className="text-lg font-bold text-foreground sm:text-xl mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-400" />
          Free Full Handbooks (Read Online)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FREE_BOOKS.map((book) => (
            <div
              key={book.slug}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/80 p-6 shadow-md backdrop-blur-md hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                    {book.badge}
                  </Badge>
                  <span className="text-xs text-muted-foreground">By {book.author}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                <Link
                  href={`/read/${book.slug}`}
                  className={buttonVariants({
                    size: "sm",
                    className: "bg-amber-accent text-black font-semibold hover:bg-amber-accent-hover text-xs h-8",
                  })}
                >
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  Read Free Online
                </Link>
                <Link
                  href={`/books/${book.slug}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "text-xs h-8 border-border/80",
                  })}
                >
                  Book Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cheat Sheets Section */}
      <div>
        <h2 className="text-lg font-bold text-foreground sm:text-xl mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-400" />
          Interview Quick-Reference Sheets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHEAT_SHEETS.map((cs) => {
            const Icon = cs.icon;
            return (
              <div
                key={cs.id}
                className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur-md hover:border-border transition-colors"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-sm"
                  style={{ backgroundColor: cs.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: cs.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-normal border-border/60">
                      {cs.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{cs.pages}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {cs.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {cs.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/read/${cs.slug}`}
                      className="text-xs font-medium text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Preview in Reader</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
