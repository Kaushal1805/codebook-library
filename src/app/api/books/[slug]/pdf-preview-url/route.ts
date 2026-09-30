import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBookBySlug } from "@/lib/data/books";
import { getBookAccess } from "@/lib/security/access";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Get current authenticated user (if any)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let userRole = "user";
    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();
      userRole = profile?.role || "user";
    }

    const user = authUser ? { id: authUser.id, role: userRole } : null;

    // 2. Fetch the book
    const book = await getBookBySlug(slug, supabase);

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    // 3. Evaluate server-side access control
    const access = await getBookAccess(user, book, supabase);

    if (access.level === "denied") {
      return NextResponse.json(
        { error: access.reason || "Access denied." },
        { status: 403 }
      );
    }

    // 4. Check if book has an uploaded PDF
    if (!book.pdfPath) {
      return NextResponse.json(
        { error: "This book does not have a PDF document uploaded yet." },
        { status: 404 }
      );
    }

    // 5. Local development uploads are served directly from the app
    if (book.pdfPath.startsWith("/uploads/")) {
      const localFilePath = path.join(process.cwd(), "public", book.pdfPath);
      if (fs.existsSync(localFilePath)) {
        return NextResponse.json({
          signedUrl: book.pdfPath,
          maxAllowedPages: access.maxAllowedPages,
          totalPages: book.pageCount,
          title: book.title,
          freePreviewPages: book.freePreviewPages || 3,
          accessLevel: access.level,
          isPurchased: access.isPurchased || false,
        });
      }
    }

    // Check if filename exists anywhere in public/uploads/books/
    const rawFileName = path.basename(book.pdfPath);
    const candidateLocalPath = path.join(process.cwd(), "public", "uploads", "books", rawFileName);
    if (fs.existsSync(candidateLocalPath)) {
      return NextResponse.json({
        signedUrl: `/uploads/books/${rawFileName}`,
        maxAllowedPages: access.maxAllowedPages,
        totalPages: book.pageCount,
        title: book.title,
        freePreviewPages: book.freePreviewPages || 3,
        accessLevel: access.level,
        isPurchased: access.isPurchased || false,
      });
    }

    // 6. Generate signed URL from private bucket 'book-pdfs'
    let signedUrl: string | null = null;

    try {
      const adminSupabase = createAdminClient();
      const { data: signData, error: signError } = await adminSupabase.storage
        .from("book-pdfs")
        .createSignedUrl(book.pdfPath, 900);

      if (!signError && signData?.signedUrl) {
        signedUrl = signData.signedUrl;
      }
    } catch {
      // Ignore
    }

    if (!signedUrl) {
      try {
        const { data: signData, error: signError } = await supabase.storage
          .from("book-pdfs")
          .createSignedUrl(book.pdfPath, 900);

        if (!signError && signData?.signedUrl) {
          signedUrl = signData.signedUrl;
        }
      } catch {
        // Ignore
      }
    }

    // If still no signed URL and file not found, return 404 so Reader uses text reader with real content
    if (!signedUrl) {
      return NextResponse.json(
        { error: "PDF file is not available for online canvas rendering." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      signedUrl,
      maxAllowedPages: access.maxAllowedPages,
      totalPages: book.pageCount,
      title: book.title,
      freePreviewPages: book.freePreviewPages || 3,
      accessLevel: access.level,
      isPurchased: access.isPurchased || false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to load preview at this time. Please try again." },
      { status: 500 }
    );
  }
}
