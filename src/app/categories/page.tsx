import { categories } from "@/lib/data/categories";
import { CategoryCard } from "@/components/ui/category-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Layers, Sparkles, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Categories — CodeBook Library",
  description: "Browse engineering books and interview preparation handbooks by domain and technology.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <Breadcrumbs items={[{ label: "Categories", href: "/categories" }]} />
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>Domain Collections</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Explore by Category
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl">
              Curated technical books and interview preparation handbooks organized by
              specialization, tools, and modern frameworks.
            </p>
          </div>

          <Link
            href="/books"
            className={buttonVariants({
              variant: "outline",
              className: "border-border/80 hover:bg-muted self-start sm:self-auto",
            })}
          >
            <BookOpen className="mr-2 h-4 w-4 text-amber-400" />
            View All Books
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
