import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookByIdAdmin } from "@/lib/data/books";
import { BookForm } from "@/components/admin/BookForm";

export const metadata = {
  title: "Edit Book — CodeBook Admin",
};

interface EditBookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const book = await getBookByIdAdmin(id, supabase);

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <BookForm initialBook={book} isEdit={true} />
    </div>
  );
}
