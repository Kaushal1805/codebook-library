import { Book, formatBookPrice } from "@/lib/data/books";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { WishlistButton } from "@/components/books/wishlist-button";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-colors duration-200 hover:border-border hover:bg-card/80">
      {/* Cover */}
      <div className="relative">
        <Link href={`/books/${book.slug}`} className="block">
          <div
            className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-zinc-950/80"
            style={{ backgroundColor: book.coverColor || "#0f172a" }}
          >
            {book.coverUrl ? (
              <>
                {/* Ambient glow background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-25 blur-xl scale-125 pointer-events-none"
                />

                {/* Uncropped Full Cover */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </>
            ) : (
              <div className="text-center px-4 z-10">
                <BookOpen
                  className="mx-auto mb-3 h-8 w-8 opacity-60"
                  style={{ color: book.coverAccent }}
                />
                <p
                  className="text-sm font-semibold leading-tight opacity-90 line-clamp-2"
                  style={{ color: book.coverAccent }}
                >
                  {book.title}
                </p>
                <p
                  className="mt-2 text-[10px] font-medium uppercase tracking-wider opacity-60"
                  style={{ color: book.coverAccent }}
                >
                  {book.author}
                </p>
              </div>
            )}
            <div className="absolute bottom-2 right-2 z-20">
              <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white/80 border border-white/10 backdrop-blur-xs">
                {book.pageCount}p
              </span>
            </div>
            <div className="absolute top-2 left-2 z-20">
              <Badge variant="secondary" className="bg-black/60 text-white/90 hover:bg-black/70 text-[10px] border border-white/10 font-normal backdrop-blur-xs">
                {book.difficulty}
              </Badge>
            </div>
          </div>
        </Link>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton bookId={book.id} bookTitle={book.title} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/books/${book.slug}`} className="hover:underline">
            <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-1">
              {book.title}
            </h3>
          </Link>
        </div>
        
        <div className="mt-1 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground line-clamp-1">{book.author}</p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-accent">
            <Star className="h-3 w-3 fill-amber-accent" />
            <span>{book.rating}</span>
          </div>
        </div>

        <Badge
          variant="outline"
          className="mt-3 w-fit text-[10px] font-normal text-muted-foreground border-border/50"
        >
          {book.category}
        </Badge>

        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {book.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {formatBookPrice(book)}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/read/${book.slug}`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground",
              })}
            >
              Preview
            </Link>
            <Link
              href={`/books/${book.slug}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-3 text-[11px]" })}
            >
              View Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
