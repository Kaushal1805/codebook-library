"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Star, Sparkles, Check, ArrowRight, ExternalLink, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<"book" | "code">("book");

  return (
    <div className="relative w-full max-w-lg select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-2xl border border-border/80 bg-card/70 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-border">
        
        {/* Top Header Controls: Toggle Book View / Live Snippet */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground">
              {activeTab === "book" ? "featured_handbook.pdf" : "preview_problem.sql"}
            </span>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/40">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                activeTab === "book"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Book Cover
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${
                activeTab === "code"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3 w-3 text-sky-400" />
              Inside Peek
            </button>
          </div>
        </div>

        {/* Tab 1: Realistic Human-Crafted Book Presentation */}
        {activeTab === "book" ? (
          <div className="relative flex items-center justify-center py-4">
            {/* Background Layer Book (Stacked Effect) */}
            <div className="absolute right-4 top-2 h-72 w-52 rounded-xl bg-slate-800/90 border border-slate-700/60 shadow-xl transform rotate-6 opacity-40 pointer-events-none hidden sm:block">
              <div className="p-4 flex flex-col justify-between h-full">
                <span className="text-[10px] font-mono text-white/40">Interview Prep #2</span>
                <p className="text-xs font-semibold text-white/50">200 SQL Questions</p>
              </div>
            </div>

            {/* Primary Hardcover Book */}
            <Link
              href="/books/sql-interview-mastery"
              className="group relative z-10 block w-60 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-border/60 transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Spine edge line */}
              <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-y-0 left-3.5 w-[1px] bg-white/10 z-20 pointer-events-none" />

              {/* Book Face */}
              <div className="relative flex flex-col justify-between bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-950 p-6 min-h-[300px]">
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5"
                  >
                    FAANG Edition
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    240 Pages
                  </span>
                </div>

                {/* Title & Author */}
                <div className="my-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    SQL Interview Mastery
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    By Alex Mercer
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-mono text-slate-300 border border-white/5">
                    <span>Window Functions &middot; CTEs &middot; Joins</span>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px]">
                  <span className="text-amber-400 font-bold font-mono">₹79</span>
                  <span className="text-muted-foreground group-hover:text-white transition-colors flex items-center gap-0.5">
                    View Details
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          /* Tab 2: Realistic Inside Problem & Solution Peek */
          <div className="py-1">
            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2.5 mb-3 border-b border-slate-800/80">
                <span className="text-amber-400 font-semibold">Q42: Dense Ranking Problem</span>
                <span className="text-emerald-400 font-medium">Difficulty: Hard</span>
              </div>
              <pre className="text-[11.5px] leading-relaxed text-slate-200 overflow-x-auto whitespace-pre-wrap">
                <span className="text-purple-400">WITH</span> RankedSalaries <span className="text-purple-400">AS</span> ({"\n"}
                {"  "}<span className="text-purple-400">SELECT</span> emp_id, department, salary,{"\n"}
                {"         "}<span className="text-sky-400">DENSE_RANK</span>() <span className="text-purple-400">OVER</span> ({"\n"}
                {"           "}<span className="text-purple-400">PARTITION BY</span> department{"\n"}
                {"           "}<span className="text-purple-400">ORDER BY</span> salary <span className="text-purple-400">DESC</span>{"\n"}
                {"         "}) <span className="text-purple-400">AS</span> salary_rank{"\n"}
                {"  "}<span className="text-purple-400">FROM</span> employees{"\n"}
                ){"\n"}
                <span className="text-purple-400">SELECT</span> emp_id, department, salary{"\n"}
                <span className="text-purple-400">FROM</span> RankedSalaries{"\n"}
                <span className="text-purple-400">WHERE</span> salary_rank &lt;= <span className="text-amber-300">3</span>;
              </pre>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10.5px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Optimal execution plan breakdown
                </span>
                <span className="text-sky-400">Chapter 3, Page 48</span>
              </div>
            </div>
          </div>
        )}

        {/* Human Touch Testimonial Banner */}
        <div className="mt-5 rounded-xl bg-muted/40 p-3 border border-border/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 font-bold text-black text-xs">
              RS
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Rahul Sharma</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Data Engineer @ Amazon
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground ml-1">
                  &ldquo;Direct, realistic questions. Cracked my interview!&rdquo;
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/read/sql-interview-mastery"
            className="shrink-0 rounded-lg bg-amber-accent/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-accent/20 border border-amber-500/20 transition-colors flex items-center gap-1"
          >
            <span>Preview</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Real Company Badges */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Trusted by engineers from:</span>
          <div className="flex items-center gap-2 font-mono text-[10px] text-foreground/80 font-medium">
            <span>Google</span>
            <span className="text-muted-foreground/40">&bull;</span>
            <span>Amazon</span>
            <span className="text-muted-foreground/40">&bull;</span>
            <span>Flipkart</span>
            <span className="text-muted-foreground/40">&bull;</span>
            <span>Uber</span>
          </div>
        </div>

      </div>
    </div>
  );
}
