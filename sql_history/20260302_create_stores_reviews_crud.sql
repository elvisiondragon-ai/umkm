-- ==================== MIGRATION: Full CRUD for Stores Reviews ====================
-- Date: 2026-03-02
-- Description: Creates stores_reviews table and sets up RLS for Edit/Delete by owner.

-- 1. Create the table if not exists (renaming for consistency with stores_product etc)
CREATE TABLE IF NOT EXISTS public.stores_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_name TEXT,
    review_text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stores_reviews ENABLE ROW LEVEL SECURITY;

-- 2. Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.stores_reviews;
CREATE POLICY "Anyone can view reviews" ON public.stores_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.stores_reviews;
CREATE POLICY "Authenticated users can insert reviews" 
ON public.stores_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.stores_reviews;
CREATE POLICY "Users can update their own reviews" 
ON public.stores_reviews FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.stores_reviews;
CREATE POLICY "Users can delete their own reviews" 
ON public.stores_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_stores_reviews_updated_at ON public.stores_reviews;
CREATE TRIGGER update_stores_reviews_updated_at
    BEFORE UPDATE ON public.stores_reviews
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
