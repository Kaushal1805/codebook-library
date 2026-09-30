import { companies } from "@/lib/data/companies";
import { CompanyCard } from "@/components/ui/company-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Briefcase, Building2, CheckCircle2, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Interview Hub — CodeBook Library",
  description: "Company-wise technical interview preparation questions, patterns, and salary benchmark guides.",
};

const STATS = [
  { label: "Target Companies", value: "25+" },
  { label: "Interview Questions", value: "1,200+" },
  { label: "Verified Experiences", value: "450+" },
  { label: "Success Rate", value: "94%" },
];

export default function InterviewHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: "Interview Hub", href: "/interview-hub" }]} />

      {/* Header Banner */}
      <div className="mt-6 mb-12 rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-background p-6 sm:p-10 shadow-xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-4">
            <Building2 className="h-3.5 w-3.5" />
            <span>Company Prep Tracks</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
            Crack Technical Rounds at Top Tech Giants
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Structured interview questions, SQL screening tests, and system design patterns
            aggregated from real hiring loops across FAANG, Fortune 500, and high-growth startups.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/books?category=Interview%20Preparation"
              className={buttonVariants({
                className: "bg-amber-accent text-black font-semibold hover:bg-amber-accent-hover",
              })}
            >
              Browse Interview Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/resources"
              className={buttonVariants({
                variant: "outline",
                className: "border-border/80",
              })}
            >
              Free Cheat Sheets
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border/50 pt-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Companies Section */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Company-Wise Question Banks
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm mt-1">
              Select a company to practice reported interview questions.
            </p>
          </div>
          <Badge variant="outline" className="border-border/80 text-xs">
            2026 Updated
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </div>

      {/* Preparation Track Tips */}
      <div className="rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          Recommended 4-Step Technical Prep Strategy
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs text-muted-foreground">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/40">
            <span className="font-mono font-bold text-amber-400 text-sm">01</span>
            <h4 className="font-semibold text-foreground text-sm">Master Window SQL</h4>
            <p>Practice CTEs, self-joins, ranking, and rolling aggregates for data rounds.</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/40">
            <span className="font-mono font-bold text-sky-400 text-sm">02</span>
            <h4 className="font-semibold text-foreground text-sm">DSA Problem Patterns</h4>
            <p>Focus on two-pointers, sliding window, hash-maps, and recursion.</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/40">
            <span className="font-mono font-bold text-emerald-400 text-sm">03</span>
            <h4 className="font-semibold text-foreground text-sm">System & AI Architecture</h4>
            <p>Understand scalable microservices, vector search, and token optimization.</p>
          </div>
          <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/40">
            <span className="font-mono font-bold text-purple-400 text-sm">04</span>
            <h4 className="font-semibold text-foreground text-sm">Mock Behavioral Rounds</h4>
            <p>Structure leadership principles and project trade-offs with the STAR format.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
