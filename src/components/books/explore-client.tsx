"use client";

import { useState, useMemo } from "react";
import { Book, books } from "@/lib/data/books";
import { BookCard } from "@/components/ui/book-card";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = ["All", "SQL", "Python", "Data Analytics", "Data Science", "Machine Learning", "Deep Learning", "GenAI", "LangChain", "RAG", "DSA", "MLOps", "Interview Preparation"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const PRICES = [
  { label: "Free", value: "free" },
  { label: "Under $20", value: "under-20" }, // Adjusted based on mock data prices
  { label: "$20–$25", value: "20-25" },
  { label: "Above $25", value: "above-25" },
];
const SORTS = ["Recommended", "Newest", "Price: Low to High", "Price: High to Low"];

export function ExploreClient({
  initialBooks,
  activeCompany = "",
}: {
  initialBooks?: Book[];
  activeCompany?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Recommended");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const togglePrice = (price: string) => {
    setSelectedPrices((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedDifficulties([]);
    setSelectedPrices([]);
    setSearchQuery("");
  };

  const allAvailableBooks = initialBooks && initialBooks.length > 0 ? initialBooks : books;

  // Filter and sort logic
  const filteredBooks = useMemo(() => {
    let result = allAvailableBooks;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeCompany) {
      const company = activeCompany.toLowerCase();
      result = result.filter(
        (b) =>
          b.companyRelevance?.toLowerCase().includes(company) ||
          b.tags.some((tag) => tag.toLowerCase().includes(company)) ||
          b.topics.some((topic) => topic.toLowerCase().includes(company))
      );
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory || b.tags.includes(selectedCategory));
    }

    // Difficulty
    if (selectedDifficulties.length > 0) {
      result = result.filter((b) => selectedDifficulties.includes(b.difficulty));
    }

    // Price
    if (selectedPrices.length > 0) {
      result = result.filter((b) => {
        if (selectedPrices.includes("free") && b.price === 0) return true;
        if (selectedPrices.includes("under-20") && b.price > 0 && b.price < 20) return true;
        if (selectedPrices.includes("20-25") && b.price >= 20 && b.price <= 25) return true;
        if (selectedPrices.includes("above-25") && b.price > 25) return true;
        return false;
      });
    }

    // Sort
    if (sortBy === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      // Mock newest by reversing the array for demonstration
      result = [...result].reverse();
    }

    return result;
  }, [allAvailableBooks, activeCompany, searchQuery, selectedCategory, selectedDifficulties, selectedPrices, sortBy]);

  const availableCategories = useMemo(() => {
    const list = ["All", ...CATEGORIES.filter((c) => c !== "All")];
    allAvailableBooks.forEach((b) => {
      if (b.category && !list.includes(b.category)) {
        list.push(b.category);
      }
    });
    return list;
  }, [allAvailableBooks]);

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + selectedDifficulties.length + selectedPrices.length;

  const FiltersContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`cursor-pointer border-border/50 font-normal transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-accent text-black hover:bg-amber-accent-hover"
                  : "hover:bg-accent"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Difficulty</h3>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map((diff) => (
            <label key={diff} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                className="rounded border-border bg-transparent accent-amber-accent"
                checked={selectedDifficulties.includes(diff)}
                onChange={() => toggleDifficulty(diff)}
              />
              {diff}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price</h3>
        <div className="flex flex-col gap-2">
          {PRICES.map((price) => (
            <label key={price.value} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                className="rounded border-border bg-transparent accent-amber-accent"
                checked={selectedPrices.includes(price.value)}
                onChange={() => togglePrice(price.value)}
              />
              {price.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-20 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                Clear all
              </button>
            )}
          </div>
          <FiltersContent />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Search and Top Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search books, topics, or questions..."
              className="pl-9 h-10 bg-card border-border/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Trigger */}
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger render={
                <Button variant="outline" size="sm" className="h-10 md:hidden bg-card">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              } />
              <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto pt-14">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left flex items-center justify-between">
                    Filters
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs font-normal text-muted-foreground">
                        Clear all
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <FiltersContent />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <div className="relative flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline-block">Sort by:</span>
              <select
                className="h-10 rounded-md border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredBooks.length}</span>
          {filteredBooks.length === 1 ? "result" : "results"} found
          {activeCompany && (
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              {activeCompany} interview prep
            </Badge>
          )}
        </div>

        {/* Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
            <Search className="h-8 w-8 text-muted-foreground/50" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">No books found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try another keyword or remove some filters.</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="mt-6" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
