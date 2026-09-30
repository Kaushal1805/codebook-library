import { books } from "@/lib/data/books";
import { BookCard } from "@/components/ui/book-card";
import { Badge } from "@/components/ui/badge";

export function FeaturedBooks() {
  return (
    <section className="border-b border-border/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Featured Books
          </h2>
          <Badge
            variant="outline"
            className="text-[10px] font-normal text-muted-foreground"
          >
            Demo content
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Popular titles for interview preparation and technical learning.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
