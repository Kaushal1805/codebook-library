-- ==============================================================================
-- CodeBook Library Migration 003: Purchases & Payment Records
-- Description: Creates the purchases table with status tracking, unique paid
--              constraints, performance indexes, and strict Row Level Security.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE public.purchases IS 'Stores user paid book purchases and Razorpay payment tracking.';
COMMENT ON COLUMN public.purchases.amount IS 'Authoritative purchased amount in INR (never trusted from frontend).';
COMMENT ON COLUMN public.purchases.status IS 'Status of payment: pending, paid, failed, or refunded.';

-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_book_id ON public.purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON public.purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

-- 2. Prevent duplicate successful purchases for the same user and book
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_paid_purchase
  ON public.purchases(user_id, book_id)
  WHERE status = 'paid';

-- 3. Row Level Security (RLS)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can read only their own purchases
DROP POLICY IF EXISTS "Users can read own purchases" ON public.purchases;
CREATE POLICY "Users can read own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all purchases for auditing/metrics
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases"
  ON public.purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users CANNOT insert, update, or delete purchases directly.
-- Payment records must be created and verified exclusively server-side via service role / server APIs.

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_purchase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_purchase_updated_at ON public.purchases;
CREATE TRIGGER set_purchase_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_updated_at();
