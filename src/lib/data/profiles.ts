export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: "user" | "admin";
  createdAt: string;
}

export async function getProfile(userId: string, supabase: any): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name || "",
    avatarUrl: data.avatar_url || "",
    role: data.role as "user" | "admin",
    createdAt: data.created_at,
  };
}

export async function updateProfile(
  userId: string,
  updates: { fullName?: string; avatarUrl?: string },
  supabase: any
): Promise<boolean> {
  const payload: any = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  return !error;
}
