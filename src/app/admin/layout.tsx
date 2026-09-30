import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/security/admin-session";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Store,
  AlertTriangle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard — CodeBook Library",
  description: "Manage books, upload covers and private PDFs, and monitor library catalog.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasAdminSession = await verifyAdminSession(
    cookieStore.get("admin_session")?.value
  );

  if (!hasAdminSession) {
    redirect("/login?next=/admin");
  }


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin Subheader Navigation */}
      <nav aria-label="Admin Navigation" className="border-b border-border/80 bg-card/60 backdrop-blur-xs sticky top-14 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-12">
          {/* Brand badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground hover:text-amber-accent transition-colors"
            >
              <span className="rounded bg-amber-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-500 font-bold">
                ADMIN
              </span>
              <span>Portal</span>
            </Link>

            <div className="h-4 w-px bg-border/60 hidden sm:block" />

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                href="/admin/books"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Books
              </Link>
              <Link
                href="/admin/books/new"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Book
              </Link>
            </div>
          </div>

          {/* Quick exit & Store link */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5",
              })}
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* Mandatory Admin Legal / Content Safety Footer Note */}
      <footer className="border-t border-border/50 py-4 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              <strong>Legal Note:</strong> Only upload books, documents, and materials that you own or have permission to distribute.
            </span>
          </div>
          <span className="hidden md:inline text-muted-foreground/60">
            CodeBook Library Admin Console
          </span>
        </div>
      </footer>
    </div>
  );
}
