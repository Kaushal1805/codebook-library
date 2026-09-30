import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Target, Sparkles, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us — CodeBook Library",
  description:
    "Learn about CodeBook Library, a developer-first digital bookstore for technical mastery and interview preparation.",
};

export default function AboutPage() {
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
        <div className="space-y-2 pb-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>CodeBook Library</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            About Us
          </h1>
          <p className="text-sm text-muted-foreground">
            Empowering developers with focused, practical, and interview-ready digital books.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            Our Mission
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            CodeBook Library was founded to bridge the gap between theoretical knowledge and real-world engineering problem solving. We curate high-yield guides covering SQL, Python, System Design, Data Structures & Algorithms, Machine Learning, and Generative AI.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            What Sets Us Apart
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Zero fluff — strictly high-yield interview questions and conceptual clarity.</li>
            <li>Instant digital reading with responsive, distraction-free readers.</li>
            <li>Direct focus on top tier technology companies and engineering expectations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
