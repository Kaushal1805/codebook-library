import { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us — CodeBook Library",
  description: "Get in touch with the CodeBook Library support team.",
};

export default function ContactPage() {
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
            <Mail className="h-4 w-4" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Contact Us
          </h1>
          <p className="text-sm text-muted-foreground">
            Have questions about a book, your library, or suggestions? We'd love to hear from you.
          </p>
        </div>

        <div className="rounded-xl bg-muted/30 border border-border/60 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Customer Support & Feedback
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For support regarding digital purchases, reading access, or library inquiries, please feel free to reach out to our team at:
          </p>
          <p className="text-sm font-mono text-amber-500">
            support@codebooklibrary.com
          </p>
        </div>
      </div>
    </div>
  );
}
