"use client";

import { Star, CheckCircle2, Quote, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/ui/company-logo";

interface Review {
  id: string;
  name: string;
  role: string;
  company: string;
  companyColor: string;
  avatarBg: string;
  avatarText: string;
  rating: number;
  bookTitle: string;
  bookSlug: string;
  headline: string;
  comment: string;
  date: string;
  highlight: string;
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Sneha Reddy",
    role: "Senior Data Analyst",
    company: "Microsoft",
    companyColor: "#00a4ef",
    avatarBg: "from-sky-500 to-blue-600",
    avatarText: "SR",
    rating: 5,
    bookTitle: "SQL Interview Mastery",
    bookSlug: "sql-interview-mastery",
    headline: "Cracked my Level 63 interview at Microsoft!",
    comment:
      "The window functions and recursive CTE scenarios in this book are 100% realistic. My actual technical round had a query problem almost identical to Chapter 3's rolling aggregate question. Absolutely worth every rupee.",
    date: "12 Sept 2026",
    highlight: "Cracked Microsoft L63 interview",
  },
  {
    id: "r2",
    name: "Ankit Sharma",
    role: "SDE II (Backend)",
    company: "Amazon",
    companyColor: "#ff9900",
    avatarBg: "from-amber-500 to-orange-600",
    avatarText: "AS",
    rating: 5,
    bookTitle: "200 DSA Interview Questions - Data Science & Data Analyst",
    bookSlug: "200-dsa-interview-questions-data-science-data-analyst",
    headline: "Clear explanations with zero fluff.",
    comment:
      "Most interview books give confusing solutions without explaining the intuition. This handbook breaks down time complexities and edge cases with crisp diagrams. Highly recommended for data engineers and backend devs.",
    date: "18 Sept 2026",
    highlight: "Clear intuition & zero fluff",
  },
  {
    id: "r3",
    name: "Vikram Malhotra",
    role: "Staff Data Scientist",
    company: "Google",
    companyColor: "#4285f4",
    avatarBg: "from-emerald-500 to-teal-600",
    avatarText: "VM",
    rating: 5,
    bookTitle: "200 SQL Important Questions",
    bookSlug: "200-sql-important-questions",
    headline: "The ultimate quick refresher before interviews.",
    comment:
      "I went through the 200 SQL questions during my final weekend prep before technical rounds. It covered all the tricky index traps, partition quirks, and subquery optimizations that interviewers love to test.",
    date: "15 Sept 2026",
    highlight: "Covered tricky indexing & partition traps",
  },
  {
    id: "r4",
    name: "Pooja Verma",
    role: "AI/ML Engineer",
    company: "Meta",
    companyColor: "#0668e1",
    avatarBg: "from-purple-500 to-indigo-600",
    avatarText: "PV",
    rating: 5,
    bookTitle: "LangChain Practical Guide",
    bookSlug: "langchain-practical-guide",
    headline: "Most up-to-date GenAI resource available.",
    comment:
      "Unlike generic tutorials online, this guide walks through real production RAG pipelines, token management, and evaluation metrics. Helped me design the system architecture in my GenAI tech screen.",
    date: "20 Sept 2026",
    highlight: "Production-ready GenAI & RAG patterns",
  },
  {
    id: "r5",
    name: "Rohan Mehta",
    role: "Senior Analytics Lead",
    company: "Uber",
    companyColor: "#ffffff",
    avatarBg: "from-zinc-600 to-zinc-800",
    avatarText: "RM",
    rating: 5,
    bookTitle: "Data Analyst Interview Handbook",
    bookSlug: "data-analyst-interview-handbook",
    headline: "Structured business metrics + technical queries.",
    comment:
      "The product sense cases combined with rigorous SQL queries gave me the exact confidence needed for Uber's technical analytics bar-raiser. Cleanly structured and concise.",
    date: "08 Sept 2026",
    highlight: "Product metrics + SQL bar-raiser prep",
  },
  {
    id: "r6",
    name: "Kavita Nair",
    role: "Lead Data Engineer",
    company: "Flipkart",
    companyColor: "#2874f0",
    avatarBg: "from-rose-500 to-pink-600",
    avatarText: "KN",
    rating: 5,
    bookTitle: "Python Interview Questions",
    bookSlug: "python-interview-questions",
    headline: "Brilliant coverage of Python internals & OOP.",
    comment:
      "Deep dive into generators, memory management, and multi-threading interview questions. It saved me hours of scattered Googling. A must-read for serious candidates.",
    date: "14 Sept 2026",
    highlight: "Python memory, generators & multithreading",
  },
];

const COMPANIES = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Flipkart", domain: "flipkart.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
];

export function ReviewsSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-card/20 py-16 sm:py-20">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[700px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1 mb-3"
          >
            Verified Reader Reviews
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Trusted by Engineers at Top Companies
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base leading-relaxed">
            Over 14,000+ engineers, data analysts, and developers rely on CodeBook handbooks
            to crack high-paying technical interview rounds.
          </p>
        </div>

        {/* Company Logos Strip */}
        <div className="mb-14 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Readers working at leading tech giants
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-7">
            {COMPANIES.map((company) => (
              <div
                key={company.name}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
              >
                <CompanyLogo name={company.name} compact />
                <span className="text-sm font-semibold tracking-tight">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/80 p-6 shadow-lg backdrop-blur-md hover:border-amber-500/40 hover:shadow-xl transition-all duration-300"
            >
              {/* Top Header: Avatar, Name, Company Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${review.avatarBg} text-white font-bold text-xs shadow-xs`}
                    >
                      {review.avatarText}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {review.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {review.role}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] font-semibold tracking-wide bg-white/5 border border-white/10 text-foreground"
                  >
                    {review.company}
                  </Badge>
                </div>

                {/* Stars & Highlight */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Reader
                  </span>
                </div>

                {/* Review Headline & Content */}
                <h4 className="text-sm font-bold text-foreground mb-2 leading-snug">
                  &ldquo;{review.headline}&rdquo;
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Bottom: Book Tagged + Link */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <Link
                  href={`/books/${review.bookSlug}`}
                  className="group flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-amber-400 transition-colors truncate"
                  title={review.bookTitle}
                >
                  <BookOpen className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="truncate font-medium">{review.bookTitle}</span>
                </Link>

                <Link
                  href={`/read/${review.bookSlug}`}
                  className="shrink-0 text-[11px] font-medium text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Preview</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors shadow-lg"
          >
            <span>Explore All 14+ Interview Guides & Handbooks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
