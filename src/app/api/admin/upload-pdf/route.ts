import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/security/admin-session";

const maxFileSize = 80 * 1024 * 1024; // 80MB
const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".md", ".epub"];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const isAdmin = (await verifyAdminSession(sessionToken)) || process.env.NODE_ENV === "development";

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Please upload a valid document or PDF file." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: "Accepted file types: .pdf, .docx, .doc, .txt, .md" },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ success: false, error: "File must be 80MB or smaller." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "books");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      pdfPath: `/uploads/books/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Error saving document:", err);
    return NextResponse.json({ success: false, error: "Unable to save the uploaded document." }, { status: 500 });
  }
}
