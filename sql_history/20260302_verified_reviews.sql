-- ==================== MIGRATION: Verified Reviews (WITH PRODUCT RELATION) ====================
-- Date: 2026-03-02
-- Description: Updates stores_reviews to link reviews to specific products and orders.

-- 1. Add columns (using BIGINT/int8 to match existing tables if needed)
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS order_id BIGINT;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.stores_product(id) ON DELETE CASCADE;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS reviewer_wa TEXT;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE public.stores_reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Add foreign key for order_id if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_reviews_order_id_fkey') THEN
        ALTER TABLE public.stores_reviews 
        ADD CONSTRAINT stores_reviews_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES public.stores_orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Add check constraint for rating
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_reviews_rating_check') THEN
        ALTER TABLE public.stores_reviews ADD CONSTRAINT stores_reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.stores_reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews (verified via app logic)" ON public.stores_reviews;
CREATE POLICY "Anyone can view reviews" ON public.stores_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews (verified via app logic)" ON public.stores_reviews FOR INSERT WITH CHECK (true);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_stores_reviews_product_id ON public.stores_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_stores_reviews_order_id ON public.stores_reviews(order_id);
