"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Library,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { WishlistButton } from "./wishlist-button";
import { createClient } from "@/lib/supabase/client";
import { checkUserBookPurchase } from "@/lib/data/purchases";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface DetailActionsProps {
  bookId?: string;
  price: number;
  displayPrice?: string;
  slug: string;
  freePreviewPages?: number;
  isMobile?: boolean;
}

export function DetailActions({
  bookId,
  price,
  displayPrice,
  slug,
  freePreviewPages = 3,
  isMobile = false,
}: DetailActionsProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [notice, setNotice] = useState<{
    msg: string;
    type: "info" | "error" | "success";
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const priceLabel = displayPrice || (price === 0 ? "Free" : `₹${price}`);

  const showToast = useCallback(
    (msg: string, type: "info" | "error" | "success" = "info") => {
      setNotice({ msg, type });
      setTimeout(() => {
        setNotice(null);
      }, 4500);
    },
    []
  );

  // 1. Check user authentication and purchase status
  useEffect(() => {
    async function checkAuthAndPurchase() {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          if (bookId) {
            const purchased = await checkUserBookPurchase(user.id, bookId, supabase);
            setIsPurchased(purchased);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoadingAuth(false);
      }
    }

    checkAuthAndPurchase();

    // Preload Razorpay checkout script on mount (0ms latency on click)
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [bookId]);

  // 2. Dynamically load Razorpay Checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        // Check again in case it loaded already
        if (window.Razorpay) return resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 3. Handle Buy Now click
  const handleBuyClick = async () => {
    // A. Unauthenticated user check (allow in dev mode for direct testing)
    const currentUserId = userId || (process.env.NODE_ENV === "development" ? "dev-user-test" : null);
    if (!currentUserId) {
      router.push(`/login?next=/books/${slug}`);
      return;
    }

    if (!bookId) {
      showToast("Book ID is missing. Please try refreshing the page.", "error");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // B. Create Razorpay order via server API (Authoritative database price)
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (orderData?.alreadyPurchased) {
          setIsPurchased(true);
          showToast("You already own this book! Full reader access is unlocked.", "success");
          setIsProcessingPayment(false);
          return;
        }
        throw new Error(orderData?.error || "Failed to create payment order.");
      }

      // C. Handle simulated order in development/test environment
      if (orderData.orderId.startsWith("order_sim_")) {
        // Execute instant verification simulation for testing
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: "sim_sig_valid",
            book_id: bookId,
          }),
        });

        if (verifyRes.ok) {
          setIsPurchased(true);
          setShowSuccessModal(true);
          setIsProcessingPayment(false);
          return;
        }
      }

      // D. Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to connect to Razorpay payment gateway. Please check your network.");
      }

      // E. Launch Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "CodeBook Library",
        description: orderData.bookTitle,
        order_id: orderData.orderId,
        image: orderData.bookCover || undefined,
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
        },
        theme: {
          color: "#f59e0b", // Amber theme
        },
        handler: async function (response: any) {
          // F. Server-Side Signature Verification (Never mark paid on client alone!)
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                book_id: bookId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsPurchased(true);
              setShowSuccessModal(true);
            } else {
              showToast(verifyData?.error || "Payment verification failed. Please contact support.", "error");
            }
          } catch {
            showToast("Network error during payment verification. Please check your connection.", "error");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            showToast("Payment checkout was cancelled.", "info");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setIsProcessingPayment(false);
        showToast(
          response.error?.description || "Payment processing failed. Please try a different payment method.",
          "error"
        );
      });

      rzp.open();
    } catch (err: any) {
      showToast(err?.message || "Payment initiation failed.", "error");
      setIsProcessingPayment(false);
    }
  };

  const buttonSize = isMobile ? "h-12 text-base" : "h-11 text-sm sm:text-base";

  return (
    <div
      className={
        isMobile
          ? "mt-8 flex flex-col gap-3 lg:hidden"
          : "hidden lg:flex flex-col gap-3"
      }
    >
      {/* Toast Notice */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : notice.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-amber-500/30 bg-amber-500/10 text-amber-500"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Success Modal Confirmation (Requirement #14) */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Payment Successful!
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Your book has been added to <strong>My Library</strong> with lifetime access, bookmarks, and complete PDF reader unlock.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                href={`/read/${slug}`}
                className={buttonVariants({
                  variant: "default",
                  className: "h-11 flex-1 font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover",
                })}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Read Now
              </Link>
              <Link
                href="/library"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 flex-1 font-medium border-border/80 hover:bg-muted/50",
                })}
              >
                <Library className="mr-2 h-4 w-4" />
                Go to My Library
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isPurchased ? (
          /* Purchased State (Requirement #12) */
          <>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-400 font-medium">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Full Book Unlocked • Lifetime Access</span>
            </div>

            <Link
              href={`/read/${slug}`}
              className={buttonVariants({
                variant: "default",
                className: `${buttonSize} w-full font-semibold bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm transition-all`,
              })}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Read Full Book
            </Link>

            <Link
              href="/library"
              className={buttonVariants({
                variant: "outline",
                className: `${buttonSize} w-full border-border/80 hover:bg-muted/50 font-medium text-foreground transition-all`,
              })}
            >
              <Library className="mr-2 h-4 w-4" />
              View in My Library
            </Link>
          </>
        ) : (
          /* Unpurchased State */
          <>
            {/* Read Free Preview Button */}
            <Link
              href={`/read/${slug}`}
              className={buttonVariants({
                variant: "default",
                className: `${buttonSize} w-full font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-sm transition-all`,
              })}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Read Free Preview
            </Link>

            {/* Buy Now Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isProcessingPayment}
              onClick={handleBuyClick}
              className={`${buttonSize} w-full border-border/80 hover:bg-muted/50 font-medium text-foreground transition-all`}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-amber-500" />
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4 opacity-70" />
                  {price === 0 ? "Download Free" : `Buy Now — ${priceLabel}`}
                </>
              )}
            </Button>
          </>
        )}

        {/* Wishlist Button */}
        {bookId && (
          <WishlistButton
            bookId={bookId}
            variant="button"
            className="w-full text-xs sm:text-sm font-medium"
            onToast={(msg) => showToast(msg, "info")}
          />
        )}
      </div>

      {!isPurchased && (
        <p className="text-center text-xs text-muted-foreground mt-1 tracking-wide">
          Read the first {freePreviewPages} pages free. Secure payment via Razorpay.
        </p>
      )}
    </div>
  );
}
