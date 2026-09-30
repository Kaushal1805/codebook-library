export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  progressPercent: number;
  lastReadAt: string;
}

export async function getReadingProgress(
  userId: string,
  bookId: string,
  supabase: any
): Promise<number | null> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("current_page")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error || !data) return null;
  return data.current_page;
}

export async function updateReadingProgress(
  userId: string,
  bookId: string,
  currentPage: number,
  progressPercent: number,
  supabase: any
): Promise<boolean> {
  const { error } = await supabase
    .from("reading_progress")
    .upsert(
      {
        user_id: userId,
        book_id: bookId,
        current_page: currentPage,
        progress_percent: progressPercent,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" }
    );

  return !error;
}
