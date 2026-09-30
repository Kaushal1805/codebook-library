"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Book,
  getAllBooksAdmin,
  deleteBookAdmin,
  updateBookStatusAdmin,
  formatBookPrice,
} from "@/lib/data/books";
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  FileEdit,
  Archive,
  ExternalLink,
  Loader2,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  useEffect(() => {
    async function loadBooks() {
      const supabase = createClient();
      const data = await getAllBooksAdmin(supabase);
      setBooks(data);
      setIsLoading(false);
    }

    loadBooks();
  }, []);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const bookStatus = book.status || "published";
      const matchesStatus =
        statusFilter === "all" || bookStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || book.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [books, searchQuery, statusFilter, categoryFilter]);

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "published" | "unpublished"
  ) => {
    const supabase = createClient();
    const res = await updateBookStatusAdmin(id, newStatus, supabase);
    if (res.success) {
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      showNotice(`Book marked as ${newStatus}.`);
    } else {
      showNotice(res.error || "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);

    const supabase = createClient();
    const res = await deleteBookAdmin(bookToDelete.id, supabase);

    if (res.success) {
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      showNotice(`"${bookToDelete.title}" was deleted.`);
      setBookToDelete(null);
    } else {
      showNotice(res.error || "Failed to delete book.");
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border/80 bg-popover px-4 py-2 text-xs font-medium text-popover-foreground shadow-lg transition-all animate-in fade-in"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Book Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your digital bookstore, adjust publishing status, and upload assets.
          </p>
        </div>

        <Link
          href="/admin/books/new"
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "bg-amber-accent text-black hover:bg-amber-accent-hover font-semibold shadow-xs",
          })}
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Add Book
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs bg-card border-border/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border/60 bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-accent"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="unpublished">Unpublished</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-border/60 bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-accent max-w-[160px]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-foreground">No books found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/50 bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Book</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Pages</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredBooks.map((book) => {
                  const status = book.status || "published";
                  const bookSlug =
                    book.slug ||
                    book.title
                      ?.toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, "")
                      .replace(/[\s_-]+/g, "-") ||
                    book.id;

                  return (
                    <tr key={book.id} className="hover:bg-muted/20 transition-colors">
                      {/* Book info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/books/${bookSlug}`}
                            target="_blank"
                            className="h-10 w-7 rounded shrink-0 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shadow-xs overflow-hidden hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: book.coverColor }}
                            title="Open book details"
                          >
                            {book.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.coverUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "PDF"
                            )}
                          </Link>
                          <div>
                            <Link
                              href={`/books/${bookSlug}`}
                              target="_blank"
                              className="font-semibold text-foreground hover:text-amber-500 transition-colors block line-clamp-1 max-w-sm"
                              title="Open book details"
                            >
                              {book.title}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">
                              By {book.author}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {book.category}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {formatBookPrice(book)}
                      </td>

                      {/* Page Count */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <span>{book.pageCount}p</span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className={`capitalize text-[10px] ${
                              status === "published"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : status === "draft"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {status}
                          </Badge>

                          {/* Quick action buttons */}
                          <div className="hidden sm:flex items-center gap-1">
                            {status !== "published" && (
                              <button
                                onClick={() => handleStatusChange(book.id, "published")}
                                className="text-[10px] text-muted-foreground hover:text-emerald-500 underline"
                                title="Publish instantly"
                              >
                                Publish
                              </button>
                            )}
                            {status === "published" && (
                              <button
                                onClick={() => handleStatusChange(book.id, "unpublished")}
                                className="text-[10px] text-muted-foreground hover:text-amber-500 underline"
                                title="Unpublish"
                              >
                                Unpublish
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Store link if published */}
                          {status === "published" && (
                            <>
                              <Link
                                href={`/books/${bookSlug}`}
                                target="_blank"
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                                title="View in store"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/read/${bookSlug}`}
                                target="_blank"
                                className="p-1.5 text-muted-foreground hover:text-amber-500 rounded-md hover:bg-muted"
                                title="Read online reader preview"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                              </Link>
                            </>
                          )}

                          {/* Edit button */}
                          <Link
                            href={`/admin/books/${book.id}/edit`}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                            title="Edit book"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setBookToDelete(book)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
                            title="Delete book"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Delete Book
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">"{bookToDelete.title}"</strong>?
              This will remove the book and its catalog entries.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setBookToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="text-xs font-semibold"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete Book"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
