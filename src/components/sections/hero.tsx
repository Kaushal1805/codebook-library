import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeroShowcase } from "./HeroShowcase";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/30 bg-radial-gradient">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-xs mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Books &middot; Interview Prep &middot; Resources</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:leading-[1.15]">
              Learn coding.
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400 bg-clip-text text-transparent">
                Prepare smarter.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Practical books, curated interview questions, and comprehensive technical
              resources built for developers and engineers aiming for top tech roles.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/books"
                className={buttonVariants({
                  size: "default",
                  className:
                    "h-11 px-6 bg-amber-accent text-black font-semibold hover:bg-amber-accent-hover shadow-lg shadow-amber-500/20 transition-all",
                })}
              >
                Explore Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/resources"
                className={buttonVariants({
                  variant: "outline",
                  size: "default",
                  className: "h-11 px-6 border-border/80 hover:bg-muted/50",
                })}
              >
                Read Free Resources
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/40 pt-6">
              <div>
                <div className="text-xl font-bold text-foreground sm:text-2xl font-mono">14+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Curated Guides</div>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground sm:text-2xl font-mono">Free</div>
                <div className="text-xs text-muted-foreground mt-0.5">Online Reader</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400 sm:text-2xl font-mono flex items-center gap-1">
                  <span>4.9</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Developer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Human-Crafted Hero Showcase */}
          <div className="relative lg:col-span-5 flex justify-center lg:justify-end">
            <HeroShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
