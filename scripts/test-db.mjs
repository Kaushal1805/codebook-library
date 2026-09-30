import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
let envContent = "";
try {
  envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...vals] = trimmed.split("=");
    if (key && vals.length > 0) {
      env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testDB() {
  console.log("Checking Supabase tables and buckets...");
  
  // 1. Check books table
  const { data: books, error: booksError } = await supabase.from("books").select("id, title, slug").limit(5);
  console.log("Books query result:", { count: books?.length, error: booksError?.message });

  // 2. Check storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  console.log("Storage buckets:", buckets?.map((b) => ({ name: b.name, public: b.public })) || bucketsError?.message);

  // 3. Ensure 'book-covers' and 'book-pdfs' buckets exist
  const hasBookCovers = buckets?.some((b) => b.name === "book-covers");
  const hasBookPdfs = buckets?.some((b) => b.name === "book-pdfs");

  if (!hasBookCovers) {
    console.log("Creating 'book-covers' bucket...");
    const { error } = await supabase.storage.createBucket("book-covers", { public: true });
    console.log("Create book-covers result:", error?.message || "Success");
  }

  if (!hasBookPdfs) {
    console.log("Creating 'book-pdfs' bucket...");
    const { error } = await supabase.storage.createBucket("book-pdfs", { public: false });
    console.log("Create book-pdfs result:", error?.message || "Success");
  }
}

testDB().catch(console.error);
