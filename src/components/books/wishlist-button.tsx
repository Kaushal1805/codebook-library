"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/data/wishlist";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  bookId: string;
  bookTitle?: string;
  className?: string;
  variant?: "icon" | "button";
  onToast?: (message: string) => void;
}

export function WishlistButton({
  bookId,
  className = "",
  variant = "icon",
  onToast,
}: WishlistButtonProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkState() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const saved = await isInWishlist(user.id, bookId, supabase);
        setInWishlist(saved);
      } else {
        // Check localStorage for guest user wishlist
        try {
          const guestWishlist = JSON.parse(
            localStorage.getItem("guest_wishlist") || "[]"
          );
          setInWishlist(guestWishlist.includes(bookId));
        } catch {
          // Ignore
        }
      }
    }

    checkState();
  }, [bookId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const supabase = createClient();

    if (!userId) {
      // Prompt sign in for wishlist persistence as requested
      router.push(`/login?next=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);

    try {
      if (inWishlist) {
        const ok = await removeFromWishlist(userId, bookId, supabase);
        if (ok) {
          setInWishlist(false);
          if (onToast) onToast("Removed from wishlist.");
        }
      } else {
        const ok = await addToWishlist(userId, bookId, supabase);
        if (ok) {
          setInWishlist(true);
          if (onToast) onToast("Added to wishlist.");
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={isLoading}
        className={`h-11 border-border/80 text-foreground transition-all ${className}`}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={`mr-2 h-4 w-4 transition-colors ${
              inWishlist ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        )}
        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs border border-border/60 text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart
          className={`h-3.5 w-3.5 transition-all ${
            inWishlist ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
      )}
    </button>
  );
}
