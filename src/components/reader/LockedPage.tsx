import { Lock, ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockedPageProps {
  priceLabel: string;
  currentPage: number;
  totalPages: number;
  onReturnToPreview: () => void;
  onUnlockClick: () => void;
}

export function LockedPage({
  priceLabel,
  currentPage,
  totalPages,
  onReturnToPreview,
  onUnlockClick,
}: LockedPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-12 text-center max-w-lg mx-auto select-none">
      {/* Lock Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 border border-border/70 mb-6 shadow-xs">
        <Lock className="h-8 w-8 text-amber-500" />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        You've reached the end of the free preview.
      </h2>

      {/* Subtitle */}
      <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
        Unlock the complete book to continue reading remaining pages and interview solutions.
      </p>

      {/* Feature list */}
      <div className="mt-6 w-full rounded-xl border border-border/50 bg-card/50 p-4 text-left space-y-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Complete access to all remaining chapters (Page {currentPage} to {totalPages})</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Full interview questions, code samples & architectural explanations</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Permanent reader bookmarking and synchronized reading progress</span>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="w-full space-y-3 pt-6 border-t border-border/40 mt-6">
        <div className="text-center mb-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {priceLabel}
          </span>
          <span className="text-xs text-muted-foreground block mt-0.5">
            One-time purchase • Lifetime access
          </span>
        </div>

        <Button
          type="button"
          onClick={onUnlockClick}
          className="w-full h-11 text-sm sm:text-base font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-xs"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Unlock the complete book ({priceLabel})
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Purchase available soon • Razorpay integration coming in Day 7
        </p>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReturnToPreview}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Return to Free Preview
        </Button>
      </div>
    </div>
  );
}
