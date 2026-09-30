"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile, Profile } from "@/lib/data/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/profile");
        return;
      }

      // Try fetching profile from Supabase
      const existingProfile = await getProfile(user.id, supabase);

      if (existingProfile) {
        setProfile(existingProfile);
        setFullName(existingProfile.fullName);
        setAvatarUrl(existingProfile.avatarUrl);
      } else {
        // Fallback initialized from auth metadata
        const fallback: Profile = {
          id: user.id,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
          role: "user",
          createdAt: user.created_at || new Date().toISOString(),
        };
        setProfile(fallback);
        setFullName(fallback.fullName);
        setAvatarUrl(fallback.avatarUrl);
      }
      setIsLoading(false);
    }

    loadUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const success = await updateProfile(
        profile.id,
        {
          fullName: fullName.trim(),
          avatarUrl: avatarUrl.trim(),
        },
        supabase
      );

      if (success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: fullName.trim(),
                avatarUrl: avatarUrl.trim(),
              }
            : null
        );
        setStatusMsg({ type: "success", text: "Profile updated successfully." });
      } else {
        setStatusMsg({ type: "error", text: "Failed to update profile. Please try again." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-accent" />
      </div>
    );
  }

  if (!profile) return null;

  const memberSinceFormatted = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="border-b border-border/50 pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal account details and reading preferences.
        </p>
      </div>

      {statusMsg && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-lg p-3.5 text-xs font-medium mb-6 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid gap-8">
        {/* Account Summary Card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            Account Information
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* Email */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address
              </span>
              <p className="text-sm font-medium text-foreground truncate">
                {profile.email}
              </p>
            </div>

            {/* Member Since */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Member Since
              </span>
              <p className="text-sm font-medium text-foreground">
                {memberSinceFormatted}
              </p>
            </div>

            {/* Role (Immutable) */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Account Role
              </span>
              <div>
                <Badge
                  variant="secondary"
                  className="capitalize font-mono text-[11px] bg-muted text-foreground border border-border/60"
                >
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Details Form */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            Edit Details
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="bg-background border-border/60 h-10 max-w-md"
                required
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="bg-background border-border/60 h-10 max-w-md"
              />
              <p className="text-[11px] text-muted-foreground">
                Optional image URL for your profile picture.
              </p>
            </div>

            {/* Role Note */}
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/40 max-w-md">
              <span>Account roles are managed securely on the server and cannot be edited.</span>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-amber-accent text-black hover:bg-amber-accent-hover font-semibold h-10 px-6 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
