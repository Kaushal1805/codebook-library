import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/security/admin-session";

const maxFileSize = 10 * 1024 * 1024; // 10MB
const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];

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
      return NextResponse.json({ success: false, error: "Please upload a valid image file." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: "Accepted image types: .png, .jpg, .jpeg, .webp, .svg" },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ success: false, error: "Cover image must be 10MB or smaller." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      success: true,
      coverUrl: `/uploads/covers/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Error saving cover:", err);
    return NextResponse.json({ success: false, error: "Unable to save the uploaded cover image." }, { status: 500 });
  }
}
