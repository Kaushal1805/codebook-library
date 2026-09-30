import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy — CodeBook Library",
  description: "Privacy policy and data protection practices at CodeBook Library.",
};

export default function PrivacyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            <span>Legal & Security</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>
              We collect minimal information required to authenticate your account and grant you access to your digital book purchases, such as your email address and basic profile details.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">2. How We Use Information</h2>
            <p>
              Your data is exclusively used to deliver digital book content, preserve reading progress, manage wishlists, and authenticate your account securely.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Payment Security</h2>
            <p>
              Payment transactions are processed directly by certified payment gateways. We never store credit card or raw payment credentials on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
