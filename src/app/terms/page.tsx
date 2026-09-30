import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms & Conditions — CodeBook Library",
  description: "Terms and conditions for purchasing and accessing CodeBook Library materials.",
};

export default function TermsPage() {
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
            <FileText className="h-4 w-4" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Digital License & Usage</h2>
            <p>
              Purchased books grant a personal, non-transferable license to read and reference the materials via CodeBook Library. Redistribution, public re-uploading, or unauthorized sharing is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Account Responsibility</h2>
            <p>
              Users are responsible for safeguarding their login credentials and maintaining the confidentiality of their account.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Content Accuracy</h2>
            <p>
              Our guides are created for educational, career prep, and reference purposes. We continuously update content to match current engineering standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
