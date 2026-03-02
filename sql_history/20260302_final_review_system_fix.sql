-- ==================== MIGRATION: Consolidated Verified Review System ====================
-- Date: 2026-03-02
-- Description: 
-- 1. Adds customer_email to stores_orders for identity tracking.
-- 2. Updates stores_reviews with BIGINT order_id and product_id relations.
-- 3. Opens RLS for stores_orders to allow frontend direct insert (The "Absolute Fix").

-- ========== 1. Fix stores_orders Table ==========
-- Add email column for stable verification
ALTER TABLE public.stores_orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
CREATE INDEX IF NOT EXISTS idx_stores_orders_customer_email ON public.stores_orders(customer_email);

-- Update RLS for stores_orders (Allow buyers to insert directly from frontend)
DROP POLICY IF EXISTS "Anyone can insert orders (buyers)" ON public.stores_orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.stores_orders;
CREATE POLICY "Anyone can insert orders" ON public.stores_orders FOR INSERT WITH CHECK (true);


-- ========== 2. Fix stores_reviews Table ==========
-- Add necessary columns for verified logic
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.stores_product(id) ON DELETE CASCADE;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS reviewer_wa TEXT;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add foreign key constraint for BIGINT order_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_reviews_order_id_fkey') THEN
        ALTER TABLE public.stores_reviews 
        ADD CONSTRAINT stores_reviews_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.stores_orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add check constraint for rating (1-5)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_reviews_rating_check') THEN
        ALTER TABLE public.stores_reviews ADD CONSTRAINT stores_reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- Update RLS for stores_reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.stores_reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews (verified via app logic)" ON public.stores_reviews;
CREATE POLICY "Anyone can view reviews" ON public.stores_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON public.stores_reviews FOR INSERT WITH CHECK (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_stores_reviews_store_id ON public.stores_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_stores_reviews_order_id ON public.stores_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_stores_reviews_product_id ON public.stores_reviews(product_id);
