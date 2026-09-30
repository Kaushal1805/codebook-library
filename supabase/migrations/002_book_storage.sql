-- ==============================================================================
-- Migration 002: Book Storage (Cover & PDF) + PDF Metadata + Admin Management
-- ==============================================================================

-- 1. Extend books table with PDF metadata and interview/SEO fields
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_name TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT,
  ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS company_relevance TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 2. Performance index for PDF path and slugs
CREATE INDEX IF NOT EXISTS idx_books_pdf_path ON public.books(pdf_path);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON public.books(updated_at DESC);

-- 3. Admin RLS Policies for books table
-- Allow admins to view all books (draft, published, unpublished)
CREATE POLICY "Admins can view all books" ON public.books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to insert new books
CREATE POLICY "Admins can insert books" ON public.books
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update books
CREATE POLICY "Admins can update books" ON public.books
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete books
CREATE POLICY "Admins can delete books" ON public.books
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Admin RLS Policies for categories table
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================================================
-- 5. Supabase Storage Buckets Setup
-- ==============================================================================

-- Create book-covers bucket (PUBLIC for browser image loading)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create book-pdfs bucket (STRICTLY PRIVATE for secure paid reader in future)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-pdfs',
  'book-pdfs',
  false, -- PRIVATE BUCKET
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- 6. Storage Security Policies
-- Book Covers: Anyone can view
CREATE POLICY "Public read book-covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

-- Book Covers: Admins can upload, replace, and delete
CREATE POLICY "Admin manage book-covers" ON storage.objects
  FOR ALL USING (
    bucket_id = 'book-covers' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Book PDFs: Only admins can view, upload, replace, or delete.
-- Anonymous / normal users have ZERO access to the private bucket.
CREATE POLICY "Admin only manage book-pdfs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'book-pdfs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
