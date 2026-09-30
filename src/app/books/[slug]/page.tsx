import { notFound } from "next/navigation";
import Link from "next/link";
import { books, formatBookPrice, Book, getBookBySlug } from "@/lib/data/books";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { DetailActions } from "@/components/books/detail-actions";
import { TableOfContents } from "@/components/books/TableOfContents";
import { RelatedBooks } from "@/components/books/RelatedBooks";
import { BookOpen, Star, CheckCircle2, FileText, BarChart, Clock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return books.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const book = (await getBookBySlug(slug, supabase)) || books.find((b) => b.slug === slug);
  if (!book) return { title: "Book Not Found — CodeBook Library" };

  return {
    title: `${book.title} — CodeBook Library`,
    description: book.description,
  };
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const book = (await getBookBySlug(slug, supabase)) || books.find((b) => b.slug === slug);

  if (!book) {
    notFound();
  }

  // Get related books:
  // For sql-interview-mastery, prioritize the prompt-specified related guides
  let relatedBooks: Book[] = [];
  if (book.slug === "sql-interview-mastery") {
    const targetSlugs = [
      "python-interview-questions",
      "pandas-interview-guide",
      "data-analyst-interview-handbook",
      "machine-learning-interview-guide",
    ];
    relatedBooks = targetSlugs
      .map((s) => books.find((b) => b.slug === s))
      .filter((b): b is (typeof books)[0] => Boolean(b));
  }

  // Fallback to same category or popular books if targetSlugs didn't yield 4
  if (relatedBooks.length < 4) {
    const additional = books
      .filter((b) => b.id !== book.id && !relatedBooks.some((r) => r.id === b.id))
      .slice(0, 4 - relatedBooks.length);
    relatedBooks = [...relatedBooks, ...additional];
  }

  const formattedPrice = formatBookPrice(book);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* 1. Breadcrumb: Home / Books / [Category] / [Book Title] */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: book.category, href: `/books?category=${encodeURIComponent(book.category)}` },
            { label: book.title },
          ]}
        />
      </nav>

      {/* Main Section */}
      <div className="grid gap-12 lg:grid-cols-[1fr_1.8fr] items-start">
        {/* LEFT COLUMN: Large book cover + Sticky actions */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-6">
          <div
            className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-zinc-950/90 backdrop-blur-md"
            style={{ backgroundColor: book.coverColor || "#0f172a" }}
          >
            {book.coverUrl ? (
              <>
                {/* Ambient blurred background glow to fill canvas gracefully */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-25 blur-2xl scale-125 pointer-events-none"
                />

                {/* Uncropped Full High-Res Cover */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                />

                {/* Glass badges */}
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-black/60 text-white/90 border border-white/10 font-medium text-[10px] backdrop-blur-md"
                  >
                    {book.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 z-20">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/80 border border-white/10 backdrop-blur-md">
                    {book.pageCount} Pages
                  </span>
                </div>
              </>
            ) : (
              <div className="relative flex flex-col justify-between h-full w-full p-6 sm:p-8">
                {/* Book spine lighting overlay */}
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 left-4 w-px bg-white/10 pointer-events-none" />

                {/* Top badges */}
                <div className="flex items-center justify-between z-10">
                  <Badge
                    variant="secondary"
                    className="bg-black/40 text-white/90 border-none font-medium text-xs backdrop-blur-xs"
                  >
                    {book.difficulty}
                  </Badge>
                  <span className="text-[11px] font-mono text-white/60 tracking-wider">
                    CodeBook
                  </span>
                </div>

                {/* Center Cover Art */}
                <div className="text-center my-auto z-10 py-6">
                  <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 backdrop-blur-xs">
                    <BookOpen
                      className="h-10 w-10 opacity-80"
                      style={{ color: book.coverAccent }}
                    />
                  </div>
                  <h2
                    className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight drop-shadow-xs"
                    style={{ color: book.coverAccent }}
                  >
                    {book.title}
                  </h2>
                  <p
                    className="mt-3 text-xs font-semibold uppercase tracking-widest opacity-75"
                    style={{ color: book.coverAccent }}
                  >
                    {book.author}
                  </p>
                </div>

                {/* Bottom Cover Metadata */}
                <div className="flex items-center justify-between text-white/60 text-xs z-10 pt-4 border-t border-white/10">
                  <span>{book.pageCount} Pages</span>
                  <span>Interview Edition</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <DetailActions
            bookId={book.id}
            price={book.price}
            displayPrice={formattedPrice}
            slug={book.slug}
            freePreviewPages={book.freePreviewPages || 3}
          />
        </div>

        {/* RIGHT COLUMN: Book Details & Information */}
        <div className="flex flex-col gap-10">
          {/* Header Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/books?category=${encodeURIComponent(book.category)}`}>
                <Badge
                  variant="outline"
                  className="font-medium text-muted-foreground border-border/60 hover:border-amber-accent/50 transition-colors"
                >
                  {book.category}
                </Badge>
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {book.title}
            </h1>

            <p className="mt-2 text-sm font-medium text-muted-foreground">
              By <span className="text-foreground">{book.author}</span>
            </p>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {book.description}
            </p>

            {/* Stats bar: Rating, Pages, Difficulty, Price */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-border/50 py-4">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Rating
                </span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Star className="h-4 w-4 fill-amber-accent text-amber-accent" />
                  <span>{book.rating}</span>
                  <span className="text-xs text-muted-foreground">({book.reviewCount})</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Page Count
                </span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{book.pageCount} pages</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Difficulty
                </span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <span>{book.difficulty}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Price
                </span>
                <div className="flex items-center gap-1.5 text-base font-bold text-foreground">
                  <span>{formattedPrice}</span>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <DetailActions
              bookId={book.id}
              price={book.price}
              displayPrice={formattedPrice}
              slug={book.slug}
              freePreviewPages={book.freePreviewPages || 3}
              isMobile={true}
            />
          </div>

          {/* Section: About This Book */}
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-bold text-foreground mb-4">
              About This Book
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm sm:text-base">
              {book.aboutText ? (
                book.aboutText.split(/(?=### )/g).map((section, sIdx) => {
                  const cleanSec = section.trim();
                  if (!cleanSec) return null;

                  if (cleanSec.startsWith("### ")) {
                    const lines = cleanSec.split("\n");
                    const heading = lines[0].replace(/^###\s*/, "");
                    const bodyLines = lines.slice(1).filter((l) => l.trim().length > 0);

                    return (
                      <div key={sIdx} className="space-y-2 mt-4 first:mt-0">
                        <h3 className="text-base font-bold text-foreground">
                          {heading}
                        </h3>
                        {bodyLines.map((line, lIdx) => {
                          const trimLine = line.trim();
                          if (trimLine.startsWith("- ") || trimLine.startsWith("• ")) {
                            return (
                              <li key={lIdx} className="ml-4 list-disc text-muted-foreground text-sm">
                                {trimLine.replace(/^[-•]\s*/, "")}
                              </li>
                            );
                          }
                          return (
                            <p key={lIdx} className="text-sm sm:text-base text-muted-foreground">
                              {trimLine}
                            </p>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <p key={sIdx} className="text-sm sm:text-base text-muted-foreground">
                      {cleanSec}
                    </p>
                  );
                })
              ) : (
                <p>{book.description}</p>
              )}
            </div>
          </section>

          {/* Section: What You'll Learn */}
          {book.whatYouWillLearn.length > 0 && (
          <section aria-labelledby="learn-heading">
            <h2 id="learn-heading" className="text-xl font-bold text-foreground mb-4">
              What You'll Learn
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3.5">
              {book.whatYouWillLearn.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3.5 text-sm text-foreground/90"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-accent mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </section>
          )}

          {/* Section: Table of Contents */}
          {book.tableOfContents.length > 0 && (
          <section aria-labelledby="toc-heading">
            <h2 id="toc-heading" className="text-xl font-bold text-foreground mb-4">
              Table of Contents
            </h2>
            <TableOfContents chapters={book.tableOfContents} />
          </section>
          )}

          {/* Section: Who Is This For */}
          {book.targetAudience && (
          <section aria-labelledby="audience-heading">
            <h2 id="audience-heading" className="text-xl font-bold text-foreground mb-4">
              Who Is This For?
            </h2>
            <div className="flex items-start gap-3.5 rounded-xl border border-border/50 bg-card p-5 text-sm text-muted-foreground leading-relaxed">
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-accent mt-0.5" />
              <p>{book.targetAudience}</p>
            </div>
          </section>
          )}
        </div>
      </div>

      {/* Related Books: "You May Also Like" */}
      <RelatedBooks books={relatedBooks} />
    </div>
  );
}
