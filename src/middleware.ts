import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/security/admin-session";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const protectedRoutes = ["/library", "/profile", "/wishlist", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const hasAdminSession = await verifyAdminSession(
    request.cookies.get("admin_session")?.value
  );
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (hasAdminSession) return response;

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token") || c.name.startsWith("sb-"));

  // If not a protected or auth route and no auth cookie, pass through instantly (0ms)
  if (!isProtectedRoute && !isAuthRoute && !hasAuthCookie) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your-supabase-url" &&
    !supabaseUrl.includes("placeholder")
  );

  if (isAuthRoute && hasAdminSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isConfigured && hasAuthCookie) {
    try {
      const supabase = createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      // Fast 300ms timeout for getUser to prevent page lag
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null } }), 300)
      );

      const {
        data: { user },
      } = await Promise.race([userPromise, timeoutPromise]);

      if (isProtectedRoute && !user && process.env.NODE_ENV === "production") {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isAuthRoute && user) {
        const destination = user.email === "admin@codebook.com" ? "/admin" : "/library";
        return NextResponse.redirect(new URL(destination, request.url));
      }
    } catch {
      // Fall through silently if Supabase is unreachable
    }
  } else if (isProtectedRoute && !hasAuthCookie && process.env.NODE_ENV === "production") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|docx|txt|md)$).*)",
  ],
};
