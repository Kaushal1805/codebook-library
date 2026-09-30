import { ExploreClient } from "@/components/books/explore-client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { getPublishedBooks } from "@/lib/data/books";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore the Library — CodeBook Library",
  description: "Find practical resources for coding, AI, data, and technical interviews.",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string | string[] }>;
}) {
  const supabase = await createClient();
  const initialBooks = await getPublishedBooks(supabase);
  const company = (await searchParams).company;
  const activeCompany = typeof company === "string" ? company.trim() : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Breadcrumbs items={[{ label: "Books", href: "/books" }]} />
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Explore the Library
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Find practical resources for coding, AI, data, and technical interviews.
          </p>
        </div>
      </div>

      <ExploreClient initialBooks={initialBooks} activeCompany={activeCompany} />
    </div>
  );
}
