export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export async function getWishlist(userId: string, supabase: any): Promise<any[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*, books(*)")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data;
}

export async function addToWishlist(userId: string, bookId: string, supabase: any): Promise<boolean> {
  const { error } = await supabase
    .from("wishlists")
    .upsert({ user_id: userId, book_id: bookId }, { onConflict: "user_id,book_id" });

  return !error;
}

export async function removeFromWishlist(userId: string, bookId: string, supabase: any): Promise<boolean> {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  return !error;
}

export async function isInWishlist(userId: string, bookId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}
