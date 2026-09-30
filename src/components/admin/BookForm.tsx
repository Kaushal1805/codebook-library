"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Book, createBookAdmin, updateBookAdmin, deleteBookAdmin } from "@/lib/data/books";
import { CoverUpload } from "./CoverUpload";
import { PdfUpload } from "./PdfUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  FileText,
  Sparkles,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const bookFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  author: z.string().min(2, "Author is required"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  price: z.number().min(0, "Price cannot be negative"),
  pageCount: z.number().int().min(1, "Page count must be at least 1"),
  freePreviewPages: z.number().int().min(1, "Free preview pages must be at least 1"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  fullDescription: z.string().min(20, "Full description must be at least 20 characters"),
  tags: z.string().optional(),
  topics: z.string().optional(),
  companyRelevance: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["draft", "published", "unpublished"]),
});

type BookFormData = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  initialBook?: Book;
  isEdit?: boolean;
}

const CATEGORIES = [
  "SQL",
  "Python",
  "Data Analytics",
  "Machine Learning",
  "GenAI",
  "LangChain",
  "RAG",
  "Data Structures & Algorithms",
  "System Design",
  "DevOps & MLOps",
];

export function BookForm({ initialBook, isEdit = false }: BookFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialBook?.title || "",
    slug: initialBook?.slug || "",
    author: initialBook?.author || "",
    category: initialBook?.category || "SQL",
    difficulty: (initialBook?.difficulty || "Intermediate") as "Beginner" | "Intermediate" | "Advanced",
    price: initialBook?.price !== undefined ? initialBook.price : 79,
    pageCount: initialBook?.pageCount || 100,
    freePreviewPages: initialBook?.freePreviewPages || 3,
    shortDescription: initialBook?.description || "",
    fullDescription: initialBook?.aboutText || "",
    tags: initialBook?.tags ? initialBook.tags.join(", ") : "",
    topics: initialBook?.topics ? initialBook.topics.join(", ") : "",
    companyRelevance: initialBook?.companyRelevance || "FAANG, Tech Startups, High-Growth Teams",
    seoTitle: initialBook?.seoTitle || "",
    seoDescription: initialBook?.seoDescription || "",
    status: (initialBook?.status || "published") as "draft" | "published" | "unpublished",
  });

  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl || "");
  const [pdfMeta, setPdfMeta] = useState({
    pdfPath: initialBook?.pdfPath || "",
    pdfFileName: initialBook?.pdfFileName || "",
    pdfFileSize: initialBook?.pdfFileSize || 0,
  });
  const [extractedPages, setExtractedPages] = useState<any[]>(initialBook?.pages || []);
  const [tocList, setTocList] = useState<string[]>(initialBook?.tableOfContents || []);
  const [learningHighlights, setLearningHighlights] = useState<string[]>(initialBook?.whatYouWillLearn || []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(
    initialBook?.category ? !CATEGORIES.includes(initialBook.category) : false
  );

  const [extractedNotice, setExtractedNotice] = useState<string>("");

  const handleDeleteBook = async () => {
    if (!initialBook?.id) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const res = await deleteBookAdmin(initialBook.id, supabase);
      if (res.success) {
        router.push("/admin/books");
        router.refresh();
      } else {
        setFormError(res.error || "Failed to delete book.");
        setShowDeleteModal(false);
      }
    } catch {
      setFormError("Failed to delete book.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAutoExtracted = (extracted: any, uploadedCoverUrl?: string) => {
    if (extracted.pages && extracted.pages.length > 0) {
      setExtractedPages(extracted.pages);
    }
    if (extracted.tableOfContents && extracted.tableOfContents.length > 0) {
      setTocList(extracted.tableOfContents);
    }
    if (extracted.whatYouWillLearn && extracted.whatYouWillLearn.length > 0) {
      setLearningHighlights(extracted.whatYouWillLearn);
    }

    setFormData((prev) => ({
      ...prev,
      title: extracted.title || prev.title,
      slug: isEdit ? prev.slug : extracted.suggestedSlug || prev.slug,
      author: extracted.author || prev.author,
      category: extracted.category || prev.category,
      difficulty: extracted.difficulty || prev.difficulty,
      price: extracted.suggestedPrice || prev.price,
      pageCount: extracted.pageCount || prev.pageCount,
      shortDescription: extracted.shortDescription || prev.shortDescription,
      fullDescription: extracted.fullDescription || prev.fullDescription,
      tags: extracted.tags && extracted.tags.length > 0 ? extracted.tags.join(", ") : prev.tags,
      topics: extracted.topics && extracted.topics.length > 0 ? extracted.topics.join(", ") : prev.topics,
      seoTitle: extracted.title ? `${extracted.title} — Book Guide` : prev.seoTitle,
      seoDescription: extracted.shortDescription || prev.seoDescription,
    }));

    if (uploadedCoverUrl) {
      setCoverUrl(uploadedCoverUrl);
    }

    setExtractedNotice(
      `✨ Document analyzed! Extracted title "${extracted.title}", author "${extracted.author}", ${extracted.pageCount} real pages, category "${extracted.category}", and auto-generated cover thumbnail.`
    );
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      // Auto-slugify if this is a new book or slug was previously matching title
      if (!isEdit) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const handleSubmit = async (submitStatus?: "draft" | "published" | "unpublished") => {
    setErrors({});
    setFormError("");

    const targetStatus = submitStatus || formData.status;

    // Validate using Zod
    const validationResult = bookFormSchema.safeParse({
      ...formData,
      status: targetStatus,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setFormError("Please fix the validation errors below.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const topicsArray = formData.topics
        ? formData.topics.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        author: formData.author.trim(),
        category: formData.category,
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        difficulty: formData.difficulty,
        price: Number(formData.price),
        pageCount: Number(formData.pageCount),
        freePreviewPages: Number(formData.freePreviewPages),
        status: targetStatus,
        coverUrl: coverUrl || undefined,
        pdfPath: pdfMeta.pdfPath || undefined,
        pdfFileName: pdfMeta.pdfFileName || undefined,
        pdfFileSize: pdfMeta.pdfFileSize || undefined,
        tags: tagsArray,
        topics: topicsArray,
        tableOfContents: tocList.length > 0 ? tocList : undefined,
        whatYouWillLearn: learningHighlights.length > 0 ? learningHighlights : undefined,
        pages: extractedPages.length > 0 ? extractedPages : undefined,
        companyRelevance: formData.companyRelevance.trim() || undefined,
        seoTitle: formData.seoTitle.trim() || formData.title.trim(),
        seoDescription: formData.seoDescription.trim() || formData.shortDescription.trim(),
      };

      if (isEdit && initialBook?.id) {
        const res = await updateBookAdmin(initialBook.id, payload, supabase);
        if (!res.success) {
          setFormError(res.error || "Failed to update book.");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await createBookAdmin(payload, supabase);
        if (!res.success) {
          setFormError(res.error || "Failed to create book.");
          setIsSubmitting(false);
          return;
        }
      }

      router.push("/admin/books");
      router.refresh();
    } catch {
      setFormError("An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/books"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEdit ? `Edit "${initialBook?.title}"` : "Create New Book"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update book details, cover, or replace PDF asset."
                : "Add a new digital book to the CodeBook Library catalog."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEdit && initialBook?.id && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={isSubmitting || isDeleting}
              className="text-xs h-9 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Book
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting || isDeleting}
            className="text-xs h-9 border-border/80"
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit("published")}
            disabled={isSubmitting || isDeleting}
            className="text-xs h-9 bg-amber-accent text-black hover:bg-amber-accent-hover font-semibold shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Publish Book"
            )}
          </Button>
        </div>
      </div>

      {extractedNotice && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-500 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{extractedNotice}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExtractedNotice("")}
            className="h-6 px-2 text-xs hover:bg-amber-500/20 text-amber-500"
          >
            Dismiss
          </Button>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3.5 text-xs text-destructive border border-destructive/20 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form Columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Core Book Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: PDF UPLOAD & AUTO-EXTRACTOR FIRST */}
          <div className="rounded-xl border border-amber-500/30 bg-card p-5 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-black text-[11px] font-bold">
                  1
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Upload Book PDF (Auto-Extracts Details)
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Upload your PDF file here. It automatically extracts Title, Author, Descriptions, Page Count, Topics, and generates a Cover from Page 1!
              </p>
            </div>

            <PdfUpload
              initialPdfPath={pdfMeta.pdfPath}
              initialPdfName={pdfMeta.pdfFileName}
              initialPdfSize={pdfMeta.pdfFileSize}
              onAutoExtracted={handleAutoExtracted}
              onPdfChange={(meta) => {
                setPdfMeta({
                  pdfPath: meta.pdfPath,
                  pdfFileName: meta.pdfFileName,
                  pdfFileSize: meta.pdfFileSize,
                });
                if (meta.extractedPageCount) {
                  setFormData((prev) => ({
                    ...prev,
                    pageCount: meta.extractedPageCount!,
                  }));
                }
              }}
            />
          </div>

          {/* Section 2: General Info */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-foreground text-[11px] font-bold border border-border">
                2
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Book Details & Descriptions (Auto-filled / Editable)
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. SQL Interview Mastery"
                className="h-10 bg-background border-border/60"
              />
              {errors.title && <p className="text-[11px] text-destructive">{errors.title}</p>}
            </div>

            {/* Slug & Author */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. sql-interview-mastery"
                  className="h-10 bg-background border-border/60 font-mono text-xs"
                />
                {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author" className="text-xs">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g. CodeBook Team"
                  className="h-10 bg-background border-border/60"
                />
                {errors.author && <p className="text-[11px] text-destructive">{errors.author}</p>}
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label htmlFor="shortDescription" className="text-xs">Short Description *</Label>
              <Textarea
                id="shortDescription"
                rows={2}
                value={formData.shortDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="A concise 1-2 sentence hook for book cards and search previews..."
                className="bg-background border-border/60 text-xs"
              />
              {errors.shortDescription && (
                <p className="text-[11px] text-destructive">{errors.shortDescription}</p>
              )}
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <Label htmlFor="fullDescription" className="text-xs">Full About Description *</Label>
              <Textarea
                id="fullDescription"
                rows={5}
                value={formData.fullDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                placeholder="Comprehensive overview of what this book covers, target interview topics, and problem breakdown..."
                className="bg-background border-border/60 text-xs leading-relaxed"
              />
              {errors.fullDescription && (
                <p className="text-[11px] text-destructive">{errors.fullDescription}</p>
              )}
            </div>
          </div>

          {/* Section 3: Separate Cover Upload (Optional / Override) */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-foreground text-[11px] font-bold border border-border">
                  3
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Book Cover Image
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Automatically generated from Page 1 of the PDF, or upload a custom cover image (Recommended: <strong>600 × 800 px</strong> or <strong>900 × 1200 px</strong>, Aspect Ratio <strong>3:4</strong>, max 5MB).
              </p>
            </div>

            <CoverUpload
              initialCoverUrl={coverUrl}
              onCoverChange={(url) => setCoverUrl(url)}
            />
          </div>

          {/* Section 3: Interview Relevance & Topics */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Interview & Technical Topics
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="companyRelevance" className="text-xs">Company Relevance</Label>
              <Input
                id="companyRelevance"
                value={formData.companyRelevance}
                onChange={(e) => setFormData({ ...formData, companyRelevance: e.target.value })}
                placeholder="e.g. Google, Meta, Amazon, Top FinTech"
                className="h-10 bg-background border-border/60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="SQL, LeetCode, Indexing, Joins"
                  className="h-10 bg-background border-border/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="topics" className="text-xs">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="Window Functions, Query Optimization"
                  className="h-10 bg-background border-border/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata, Pricing & SEO */}
        <div className="space-y-6">
          {/* Publishing & Classification */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Publishing & Status
            </h2>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "draft" | "published" | "unpublished",
                  })
                }
                className="w-full h-10 rounded-md border border-border/60 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-accent"
              >
                <option value="published">Published (Visible in store)</option>
                <option value="draft">Draft (Hidden from public)</option>
                <option value="unpublished">Unpublished (Archived)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-xs">Category *</Label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  {isCustomCategory ? "← Choose from presets" : "✏️ Type Custom Category"}
                </button>
              </div>

              {isCustomCategory ? (
                <div className="space-y-1">
                  <Input
                    id="category"
                    list="category-preset-options"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Type custom category (e.g. Next.js, Cyber Security, Rust...)"
                    className="h-10 bg-background border-amber-500/50 focus:border-amber-500 text-xs"
                    autoFocus
                  />
                  <datalist id="category-preset-options">
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-[10px] text-muted-foreground">
                    Type any category. It will automatically create and appear in store filters.
                  </p>
                </div>
              ) : (
                <select
                  id="category"
                  value={CATEGORIES.includes(formData.category) ? formData.category : "custom_selected"}
                  onChange={(e) => {
                    if (e.target.value === "custom_selected") {
                      setIsCustomCategory(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full h-10 rounded-md border border-border/60 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-accent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom_selected">✏️ + Type Custom Category...</option>
                </select>
              )}
              {errors.category && <p className="text-[11px] text-destructive">{errors.category}</p>}
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label htmlFor="difficulty" className="text-xs">Difficulty</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as "Beginner" | "Intermediate" | "Advanced",
                  })
                }
                className="w-full h-10 rounded-md border border-border/60 bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-accent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Price (INR) */}
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs">Price (₹ INR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="h-10 bg-background border-border/60"
              />
              {errors.price && <p className="text-[11px] text-destructive">{errors.price}</p>}
            </div>

            {/* Page Count & Free Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pageCount" className="text-xs">Total Pages</Label>
                <Input
                  id="pageCount"
                  type="number"
                  min="1"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })}
                  className="h-10 bg-background border-border/60"
                />
                {errors.pageCount && (
                  <p className="text-[11px] text-destructive">{errors.pageCount}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="freePreviewPages" className="text-xs">Free Preview</Label>
                <Input
                  id="freePreviewPages"
                  type="number"
                  min="1"
                  value={formData.freePreviewPages}
                  onChange={(e) =>
                    setFormData({ ...formData, freePreviewPages: Number(e.target.value) })
                  }
                  className="h-10 bg-background border-border/60"
                />
                {errors.freePreviewPages && (
                  <p className="text-[11px] text-destructive">{errors.freePreviewPages}</p>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Default: 3 free preview pages. Locked reader gates remaining pages.
            </p>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO Optimization
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="seoTitle" className="text-xs">SEO Meta Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Defaults to book title"
                className="h-10 bg-background border-border/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seoDescription" className="text-xs">SEO Meta Description</Label>
              <Textarea
                id="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, seoDescription: e.target.value })
                }
                placeholder="Defaults to short description"
                className="bg-background border-border/60 text-xs"
              />
            </div>
          </div>

          {/* Danger Zone (Delete Book) */}
          {isEdit && initialBook?.id && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Danger Zone
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permanently delete this book, its catalog listings, and associated uploaded assets.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting || isDeleting}
                className="w-full text-xs font-semibold gap-1.5 h-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete This Book
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              <strong className="text-foreground">"{formData.title || initialBook?.title}"</strong>?
              This will remove the book and all its pages from the library.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="text-xs font-semibold"
                onClick={handleDeleteBook}
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
    </form>
  );
}
