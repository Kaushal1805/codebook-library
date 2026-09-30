import { NextResponse } from "next/server";
import { adminSession, createAdminSession } from "@/lib/security/admin-session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, message: "Admin authentication is not configured" },
        { status: 503 }
      );
    }

    if (normalizedEmail === adminEmail && password === adminPassword) {
      const response = NextResponse.json({ success: true, redirect: "/admin" });
      response.cookies.set({
        name: adminSession.cookieName,
        value: await createAdminSession(),
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: adminSession.duration,
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid admin credentials" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
