import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminMetrics, formatBookPrice } from "@/lib/data/books";
import {
  BookOpen,
  CheckCircle2,
  FileEdit,
  Archive,
  Layers,
  PlusCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard — CodeBook Library",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const metrics = await getAdminMetrics(supabase);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time catalog metrics and recent publishing activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/books/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-amber-accent text-black hover:bg-amber-accent-hover font-semibold shadow-xs",
            })}
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add New Book
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total Books */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Books</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {metrics.totalBooks}
          </p>
        </div>

        {/* Published */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Published</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.publishedCount}
          </p>
        </div>

        {/* Drafts */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Drafts</span>
            <FileEdit className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.draftCount}
          </p>
        </div>

        {/* Unpublished */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Unpublished</span>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {metrics.unpublishedCount}
          </p>
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Categories</span>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {metrics.categoriesCount}
          </p>
        </div>
      </div>

      {/* Recent Books Section */}
      <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Recent Books
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest books added or updated in the catalog.
            </p>
          </div>
          <Link
            href="/admin/books"
            className="text-xs font-medium text-amber-accent hover:underline inline-flex items-center gap-1"
          >
            View all books
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {metrics.recentBooks.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No books found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-medium">Book</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {metrics.recentBooks.map((book) => {
                  const status = book.status || "published";
                  return (
                    <tr key={book.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-8 w-6 rounded shrink-0 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: book.coverColor }}
                          >
                            PDF
                          </div>
                          <div>
                            <span className="font-semibold block truncate max-w-xs">
                              {book.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              By {book.author}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {book.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {formatBookPrice(book)}
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/books/${book.id}/edit`}
                            className="text-xs text-muted-foreground hover:text-foreground font-medium"
                          >
                            Edit
                          </Link>
                          {status === "published" && (
                            <Link
                              href={`/books/${book.slug}`}
                              target="_blank"
                              className="text-muted-foreground hover:text-foreground p-1"
                              title="View in store"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
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
    </div>
  );
}
