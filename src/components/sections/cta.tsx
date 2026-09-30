import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CTA() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-lg border border-border/60 bg-card px-6 py-10 text-center sm:px-12">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-accent">
            Start preparing today
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Your next interview starts with
            <br className="hidden sm:block" /> better preparation.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Browse our collection of books, practice questions, and free
            resources to build your confidence.
          </p>
          <div className="mt-6">
            <Link href="/books" className={buttonVariants({ size: "sm", className: "h-9 bg-amber-accent text-black hover:bg-amber-accent-hover" })}>
              Explore the Library
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
