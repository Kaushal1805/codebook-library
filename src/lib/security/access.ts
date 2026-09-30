import { Book } from "@/lib/data/books";
import { checkUserBookPurchase } from "@/lib/data/purchases";

export type BookAccessLevel = "preview" | "full" | "denied";

export interface BookAccessResult {
  level: BookAccessLevel;
  maxAllowedPages: number;
  reason?: string;
  isPurchased?: boolean;
}

/**
 * Evaluates access permission for a given user and book.
 * 
 * Day 7 Flow:
 * 1. Unpublished / Draft books are restricted to administrators.
 * 2. If user is authenticated, query the database for a verified 'paid' purchase.
 * 3. If verified purchase exists -> returns 'full' access (all pages unlocked).
 * 4. If not purchased or anonymous -> returns 'preview' access (first free_preview_pages).
 */
export async function getBookAccess(
  user: { id: string; role?: string } | null,
  book: Book,
  client?: any
): Promise<BookAccessResult> {
  const isAdmin = user?.role === "admin";
  const bookStatus = book.status || "published";

  // 1. Unpublished / Draft books are restricted to administrators
  if (bookStatus !== "published") {
    if (isAdmin) {
      return {
        level: "full",
        maxAllowedPages: book.pageCount,
        reason: "Admin preview of unpublished book",
        isPurchased: true,
      };
    }
    return {
      level: "denied",
      maxAllowedPages: 0,
      reason: "This book is not currently published.",
      isPurchased: false,
    };
  }

  // 2. Verified purchase check for authenticated users (Day 7)
  if (user?.id) {
    const hasPurchased = await checkUserBookPurchase(user.id, book.id, client);
    if (hasPurchased) {
      return {
        level: "full",
        maxAllowedPages: book.pageCount,
        reason: "Verified purchase unlocked",
        isPurchased: true,
      };
    }
  }

  // 3. Fallback: Free preview access (anonymous or non-purchaser)
  const freePreviewPages =
    book.freePreviewPages && book.freePreviewPages > 0
      ? book.freePreviewPages
      : 3;

  return {
    level: "preview",
    maxAllowedPages: freePreviewPages,
    reason: "Free preview access",
    isPurchased: false,
  };
}
