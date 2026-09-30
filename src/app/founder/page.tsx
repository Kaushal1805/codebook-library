import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, GraduationCap, Sparkles, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Founder — CodeBook Library",
  description:
    "Kaushal Kumar is a Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning and the creator of CodeBook Library.",
};

export default function FounderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <Link
          href="/"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-xs text-muted-foreground hover:text-foreground gap-1.5 pl-0",
          })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Store
        </Link>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-accent/15 text-amber-500 border border-amber-accent/25 text-2xl font-bold font-mono shrink-0">
            KK
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Kaushal Kumar
              </h1>
            </div>
            <p className="text-sm font-medium text-amber-500">
              Founder & Creator of CodeBook Library
            </p>
          </div>
        </div>

        {/* Education & Background */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-amber-500" />
            Education & Specialization
          </h2>

          <div className="rounded-xl bg-muted/30 border border-border/60 p-4 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              B.Tech in Computer Science & Engineering
            </p>
            <p className="text-xs text-muted-foreground">
              Specialization: Artificial Intelligence & Machine Learning
            </p>
          </div>
        </div>

        {/* About the Founder */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            About
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Kaushal Kumar is a Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning and the creator of CodeBook Library.
          </p>
        </div>

        {/* Mission / Vision */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-500" />
            About CodeBook Library
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            CodeBook Library was built to provide developers, engineers, and students with focused, practical, and interview-ready digital books and technical reference guides.
          </p>
        </div>
      </div>
    </div>
  );
}
