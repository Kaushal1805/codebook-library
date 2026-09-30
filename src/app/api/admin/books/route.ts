import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { verifyAdminSession } from "@/lib/security/admin-session";

const customBooksPath = path.join(process.cwd(), "src", "data", "custom-books.json");

function getCustomBooks() {
  try {
    if (fs.existsSync(customBooksPath)) {
      const data = fs.readFileSync(customBooksPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading custom-books.json:", err);
  }
  return [];
}

function saveCustomBooks(books: any[]) {
  try {
    const dir = path.dirname(customBooksPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(customBooksPath, JSON.stringify(books, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing custom-books.json:", err);
    return false;
  }
}

async function isAdminRequest() {
  if (process.env.NODE_ENV === "development") return true;
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get("admin_session")?.value);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const books = getCustomBooks();
  return NextResponse.json({ success: true, books });
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const payload = await request.json();
    const books = getCustomBooks();

    const newBook = {
      id: payload.id || `custom-book-${Date.now()}`,
      title: payload.title,
      slug: payload.slug,
      author: payload.author,
      category: payload.category || payload.categoryId || "General",
      description: payload.shortDescription || payload.description || "",
      price: Number(payload.price || 0),
      displayPrice: `₹${payload.price || 0}`,
      difficulty: payload.difficulty || "Intermediate",
      coverColor: payload.coverColor || "#1e293b",
      coverAccent: payload.coverAccent || "#f59e0b",
      pageCount: Number(payload.pageCount || (payload.pages ? payload.pages.length : 10)),
      rating: Number(payload.rating || 5.0),
      reviewCount: Number(payload.reviewCount || 1),
      tags: payload.tags || ["Interview Prep"],
      topics: payload.topics || ["Questions", "Answers"],
      aboutText: payload.fullDescription || payload.aboutText || payload.shortDescription || "",
      whatYouWillLearn:
        payload.whatYouWillLearn && payload.whatYouWillLearn.length > 0
          ? payload.whatYouWillLearn
          : payload.topics || ["Core technical concepts", "Interview questions and answers"],
      tableOfContents:
        payload.tableOfContents && payload.tableOfContents.length > 0
          ? payload.tableOfContents
          : payload.topics || [
              "01 — Overview & Core Concepts",
              "02 — High Frequency Questions",
              "03 — Advanced Scenarios",
              "04 — Detailed Solutions",
            ],
      targetAudience: payload.targetAudience || "Engineers and candidates preparing for technical interviews.",
      status: payload.status || "published",
      freePreviewPages: Number(payload.freePreviewPages || 3),
      coverUrl: payload.coverUrl || "",
      pdfPath: payload.pdfPath || "",
      pdfFileName: payload.pdfFileName || (payload.slug ? `${payload.slug}.pdf` : "document.pdf"),
      pdfFileSize: payload.pdfFileSize || 0,
      pages: payload.pages || [],
      companyRelevance: payload.companyRelevance || "Top Tech Companies, Startups",
      seoTitle: payload.seoTitle || `${payload.title} — CodeBook Library`,
      seoDescription: payload.seoDescription || payload.shortDescription || payload.title,
      updatedAt: new Date().toISOString(),
    };

    // Replace if existing slug or id, otherwise append
    const existingIndex = books.findIndex((b: any) => b.id === newBook.id || b.slug === newBook.slug);
    if (existingIndex >= 0) {
      books[existingIndex] = { ...books[existingIndex], ...newBook };
    } else {
      books.unshift(newBook);
    }

    saveCustomBooks(books);

    return NextResponse.json({ success: true, book: newBook });
  } catch (err: any) {
    console.error("Error saving book:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save book" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    let books = getCustomBooks();
    books = books.filter((b: any) => b.id !== id && b.slug !== slug);
    saveCustomBooks(books);

    return NextResponse.json({ success: true, books });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete book" },
      { status: 500 }
    );
  }
}
