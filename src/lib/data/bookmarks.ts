export interface Bookmark {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  title?: string;
  createdAt: string;
}

export async function getBookmarks(userId: string, bookId: string, supabase: any): Promise<number[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("page_number")
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error || !data) return [];
  return data.map((b: any) => b.page_number);
}

export async function addBookmark(
  userId: string,
  bookId: string,
  pageNumber: number,
  title: string,
  supabase: any
): Promise<boolean> {
  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: userId, book_id: bookId, page_number: pageNumber, title },
      { onConflict: "user_id,book_id,page_number" }
    );

  return !error;
}

export async function removeBookmark(
  userId: string,
  bookId: string,
  pageNumber: number,
  supabase: any
): Promise<boolean> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page_number", pageNumber);

  return !error;
}
