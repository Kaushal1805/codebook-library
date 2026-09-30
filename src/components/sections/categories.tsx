import { categories } from "@/lib/data/categories";
import { CategoryCard } from "@/components/ui/category-card";

export function Categories() {
  return (
    <section className="border-b border-border/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Browse by Category
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Find books and resources organized by technology and topic.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
