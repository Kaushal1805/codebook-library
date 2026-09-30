import Link from "next/link";
import { BookX, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function BookNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-6 border border-border/60">
        <BookX className="h-8 w-8 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Book not found.
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        The book you are looking for might have been moved, renamed, or is currently unavailable in our catalog.
      </p>

      <div className="mt-8">
        <Link
          href="/books"
          className={buttonVariants({
            variant: "default",
            className: "h-11 px-6 font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </div>
    </div>
  );
}
