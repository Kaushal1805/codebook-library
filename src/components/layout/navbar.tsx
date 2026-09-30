"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Library,
  Heart,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Books", href: "/books" },
  { label: "Categories", href: "/categories" },
  { label: "Interview Hub", href: "/interview-hub" },
  { label: "Free Resources", href: "/resources" },
];

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; fullName?: string; role?: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUserSession() {
      try {
        // Fast local session read (0ms)
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData?.session?.user;

        if (currentUser) {
          let role = "user";
          try {
            const profilePromise = supabase
              .from("profiles")
              .select("role")
              .eq("id", currentUser.id)
              .single();
            const timeoutPromise = new Promise<{ data: null }>((resolve) =>
              setTimeout(() => resolve({ data: null }), 300)
            );
            const profileRes = await Promise.race([profilePromise, timeoutPromise]);
            if (profileRes?.data?.role) role = profileRes.data.role;
          } catch {
            // Ignore
          }

          setUser({
            id: currentUser.id,
            email: currentUser.email,
            fullName: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
            role,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    }

    getUserSession();

    // Listen for real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let role = "user";
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (profile?.role) role = profile.role;
        } catch {
          // Ignore
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          role,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80 shrink-0"
        >
          <BookOpen className="h-5 w-5 text-amber-accent" />
          <span className="text-sm font-semibold tracking-tight">
            CodeBook Library
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Search + Auth / Profile Menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/books"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-2">
            {!isLoadingUser && user ? (
              /* Logged In: Profile Menu */
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-xs text-foreground hover:bg-accent"
                      aria-label="User profile menu"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-accent/20 text-amber-500 font-semibold text-[10px]">
                        {user.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="font-medium max-w-[120px] truncate">
                        {user.fullName || "Account"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  }
                />
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="w-56 p-1.5 shadow-xl border border-border/80 bg-card rounded-xl"
                >
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.fullName || "Reader"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/library"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted/60 rounded-md transition-colors"
                    >
                      <Library className="h-3.5 w-3.5 text-amber-accent" />
                      <span>My Library</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted/60 rounded-md transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted/60 rounded-md transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Profile</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-500 font-semibold hover:bg-amber-500/10 rounded-md transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-border/40">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : !isLoadingUser ? (
              /* Logged Out: Login & Create Account */
              <>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "h-8 text-xs text-foreground hover:bg-accent",
                  })}
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className={buttonVariants({
                    variant: "default",
                    size: "sm",
                    className: "h-8 text-xs font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover shadow-xs",
                  })}
                >
                  Create Account
                </Link>
              </>
            ) : (
              <div className="h-8 w-20 bg-muted/40 rounded animate-pulse" />
            )}
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-5 flex flex-col justify-between">
              <div>
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-amber-accent" />
                    CodeBook Library
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Links */}
                <nav className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Logged-in Links */}
                {user && (
                  <div className="mt-6 pt-6 border-t border-border/40 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                      Account
                    </span>
                    <Link
                      href="/library"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Library className="h-4 w-4 text-amber-accent" />
                      My Library
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      Wishlist
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-amber-500 font-semibold hover:bg-accent"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Portal
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Auth Bottom Section */}
              <div className="pt-6 border-t border-border/40">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 h-10 text-xs font-semibold text-destructive border border-destructive/20 bg-destructive/5 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full h-10 text-xs",
                      })}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className={buttonVariants({
                        variant: "default",
                        className: "w-full h-10 text-xs font-semibold bg-amber-accent text-black hover:bg-amber-accent-hover",
                      })}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
