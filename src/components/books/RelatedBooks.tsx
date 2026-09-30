import { Book } from "@/lib/data/books";
import { BookCard } from "@/components/ui/book-card";

interface RelatedBooksProps {
  books: Book[];
}

export function RelatedBooks({ books }: RelatedBooksProps) {
  if (books.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border/40 pt-16" aria-labelledby="related-books-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 id="related-books-heading" className="text-2xl font-bold tracking-tight text-foreground">
            You May Also Like
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated engineering interview prep guides frequently read with this book.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
