import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { books, getBookBySlug } from "@/lib/data/books";
import { getPreviewContent } from "@/lib/data/bookContent";
import { getBookAccess } from "@/lib/security/access";
import { Reader } from "@/components/reader/Reader";
import type { Metadata } from "next";

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
  const book = await getBookBySlug(slug, supabase);

  if (!book) return { title: "Reading: Book Not Found — CodeBook Library" };

  const previewPages = book.freePreviewPages || 3;
  return {
    title: `Reading: ${book.title} — CodeBook Library`,
    description: `Read ${book.title} online with CodeBook interactive reader.`,
  };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch book from Supabase (or fallback)
  const book = await getBookBySlug(slug, supabase);

  if (!book) {
    notFound();
  }

  // 2. Authenticated user session check (fast timeout protected)
  let authUser: any = null;
  try {
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 800)
    );
    const authRes = await Promise.race([userPromise, timeoutPromise]);
    authUser = authRes?.data?.user || null;
  } catch {
    authUser = null;
  }

  let userRole = "user";
  if (authUser) {
    try {
      const profilePromise = supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();
      const timeoutPromise = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 800)
      );
      const profileRes = await Promise.race([profilePromise, timeoutPromise]);
      userRole = profileRes?.data?.role || "user";
    } catch {
      userRole = "user";
    }
  }

  const user = authUser ? { id: authUser.id, role: userRole } : null;

  // 3. Evaluate server-side access control (checks purchases in Day 7)
  const access = await getBookAccess(user, book, supabase);

  if (access.level === "denied") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Book Unavailable
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
          {access.reason || "This book is not currently published. Please check back later."}
        </p>
      </div>
    );
  }

  const isPurchased = access.level === "full" && access.isPurchased;
  const totalPages = book.pageCount || 10;
  const allowedPages = isPurchased ? totalPages : access.maxAllowedPages;

  // 4. Fetch preview content from extracted pages or book data
  const previewData = await getPreviewContent(slug, book);

  const fallbackPages = (book.tableOfContents && book.tableOfContents.length > 0)
    ? book.tableOfContents.slice(0, 5).map((toc, i) => ({
        pageNumber: i + 1,
        title: toc,
        content: `<h1>${toc}</h1><p>${book.description || book.aboutText}</p>${
          book.whatYouWillLearn && book.whatYouWillLearn[i]
            ? `<div class="mt-4 p-4 rounded-lg bg-card/60 border border-border/50"><strong>Key Topic:</strong> ${book.whatYouWillLearn[i]}</div>`
            : ""
        }`,
      }))
    : [
        {
          pageNumber: 1,
          title: "Introduction",
          content: `<h1>${book.title}</h1><p class="lead">By <strong>${book.author}</strong></p><p>${book.description || book.aboutText}</p>`,
        },
      ];

  const finalPreviewData = previewData || {
    bookSlug: book.slug,
    totalPages,
    previewPages: allowedPages,
    chapterList: Array.from({ length: totalPages }, (_, i) => ({
      pageNumber: i + 1,
      title: fallbackPages[i]?.title || `Chapter ${i + 1}`,
      isPreview: isPurchased || i < allowedPages,
    })),
    pages: fallbackPages,
  };

  return (
    <Reader
      book={book}
      previewData={finalPreviewData}
      isPurchased={Boolean(isPurchased)}
    />
  );
}
