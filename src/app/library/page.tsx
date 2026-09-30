import Link from "next/link";
import Image from "next/image";
import { BookOpen, Compass, ArrowRight, Calendar, BookCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getUserPurchases } from "@/lib/data/purchases";
import { getBookById } from "@/lib/data/books";
import { getReadingProgress } from "@/lib/data/progress";

export const metadata = {
  title: "My Library — CodeBook Library",
  description: "Access your purchased engineering books and reading progress.",
};

export default async function LibraryPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Library
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Please log in to access your purchased books and reading progress.
        </p>
        <div className="mt-6">
          <Link
            href="/login?next=/library"
            className={buttonVariants({
              variant: "default",
              className: "h-11 px-6 font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover",
            })}
          >
            Log In to Library
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch real user purchases
  const purchases = await getUserPurchases(user.id, supabase);

  // 3. Populate book and reading progress details for each purchase
  const libraryItems = await Promise.all(
    purchases.map(async (purchase) => {
      const book = await getBookById(purchase.bookId, supabase);
      if (!book) return null;

      let currentPage = 1;
      try {
        const savedPage = await getReadingProgress(user.id, book.id, supabase);
        if (savedPage) currentPage = savedPage;
      } catch {
        // Fallback
      }

      const totalPages = book.pageCount || 10;
      const progressPercent = Math.min(100, Math.round((currentPage / totalPages) * 100));

      return {
        purchase,
        book,
        currentPage,
        totalPages,
        progressPercent,
      };
    })
  );

  const activeBooks = libraryItems.filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="border-b border-border/50 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your purchased engineering books with synchronized reader progress.
          </p>
        </div>
        {activeBooks.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-400 font-medium self-start sm:self-auto">
            <BookCheck className="h-4 w-4" />
            <span>{activeBooks.length} {activeBooks.length === 1 ? "Book" : "Books"} Unlocked</span>
          </div>
        )}
      </div>

      {activeBooks.length === 0 ? (
        /* Empty State (Requirement #13: "Your library is empty." + "Explore Books") */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center min-h-[360px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 border border-border/60 mb-5">
            <BookOpen className="h-8 w-8 text-muted-foreground/80" />
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Your library is empty.
          </h2>

          <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You haven't purchased any books yet. Explore our technical interview guides and system design manuals to unlock full lifetime access.
          </p>

          <div className="mt-8">
            <Link
              href="/books"
              className={buttonVariants({
                variant: "default",
                className: "h-11 px-6 font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-xs",
              })}
            >
              <Compass className="mr-2 h-4 w-4" />
              Explore Books
            </Link>
          </div>
        </div>
      ) : (
        /* Purchased Books Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeBooks.map((item) => {
            if (!item) return null;
            const { book, purchase, currentPage, totalPages, progressPercent } = item;
            const purchaseDateFormatted = purchase.purchasedAt
              ? new Date(purchase.purchasedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            return (
              <div
                key={purchase.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs hover:border-border transition-all"
              >
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full flex-col justify-between p-2 text-white"
                        style={{ backgroundColor: book.coverColor || "#1e3a5f" }}
                      >
                        <span className="text-[8px] font-mono text-white/70 uppercase truncate">
                          {book.category}
                        </span>
                        <BookOpen className="h-5 w-5 self-center text-white/90" />
                        <span className="text-[9px] font-bold leading-tight line-clamp-2">
                          {book.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground mb-1.5">
                        {book.category}
                      </span>
                      <h3 className="text-base font-bold text-foreground truncate group-hover:text-amber-500 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {book.author}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>Purchased {purchaseDateFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Reading Progress Indicator */}
                <div className="mt-5 space-y-2 border-t border-border/40 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">
                      Page {currentPage} of {totalPages}
                    </span>
                    <span className="font-semibold text-foreground">
                      {progressPercent}% completed
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-accent transition-all duration-300"
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-1 flex items-center gap-2">
                  <Link
                    href={`/read/${book.slug}`}
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                      className: "h-9 flex-1 text-xs font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover",
                    })}
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    Continue Reading
                  </Link>
                  <Link
                    href={`/books/${book.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-9 text-xs px-3 border-border/70 hover:bg-muted/50",
                    })}
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
