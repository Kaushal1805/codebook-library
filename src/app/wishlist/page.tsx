"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Compass, Trash2, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getWishlist, removeFromWishlist } from "@/lib/data/wishlist";
import { books, Book, formatBookPrice } from "@/lib/data/books";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    async function loadWishlist() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/wishlist");
        return;
      }

      const items = await getWishlist(user.id, supabase);

      // Match items with books (either from join or fallback mock books)
      if (items.length > 0) {
        const loaded: Book[] = [];
        for (const item of items) {
          const match =
            books.find((b) => b.id === item.book_id || b.slug === item.book_id) ||
            (item.books ? {
              id: item.books.id,
              title: item.books.title,
              slug: item.books.slug,
              author: item.books.author,
              category: "SQL",
              description: item.books.short_description,
              price: Number(item.books.price),
              difficulty: "Intermediate",
              coverColor: "#1e3a5f",
              coverAccent: "#4a9eff",
              pageCount: item.books.page_count,
              rating: 4.8,
              reviewCount: 120,
              tags: [],
              topics: [],
              aboutText: item.books.full_description,
              whatYouWillLearn: [],
              tableOfContents: [],
              targetAudience: "",
            } as Book : null);

          if (match && !loaded.some((b) => b.id === match.id)) {
            loaded.push(match);
          }
        }
        setWishlistBooks(loaded);
      } else {
        setWishlistBooks([]);
      }
      setIsLoading(false);
    }

    loadWishlist();
  }, [router]);

  const handleRemove = async (bookId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const ok = await removeFromWishlist(user.id, bookId, supabase);
    if (ok) {
      setWishlistBooks((prev) => prev.filter((b) => b.id !== bookId && b.slug !== bookId));
      showToast("Removed from wishlist.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="border-b border-border/50 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Books and interview guides you've saved for later.
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">
          {wishlistBooks.length} {wishlistBooks.length === 1 ? "book" : "books"}
        </span>
      </div>

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border/80 bg-popover px-4 py-2 text-xs font-medium text-popover-foreground shadow-lg transition-all animate-in fade-in slide-in-from-top-2"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {wishlistBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center min-h-[360px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 border border-border/60 mb-5">
            <Heart className="h-8 w-8 text-muted-foreground/70" />
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Your wishlist is empty.
          </h2>

          <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Explore our collection of interview guides and click the heart icon to save titles you want to read later.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistBooks.map((book) => (
            <div
              key={book.id}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:border-border"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {book.category}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleRemove(book.id)}
                    aria-label={`Remove ${book.title} from wishlist`}
                    title="Remove from wishlist"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <Link href={`/books/${book.slug}`} className="hover:underline">
                  <h3 className="text-base font-semibold text-foreground line-clamp-1">
                    {book.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground mt-1">
                  By {book.author}
                </p>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  {formatBookPrice(book)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/read/${book.slug}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "h-8 text-xs",
                    })}
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/books/${book.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-8 text-xs",
                    })}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
