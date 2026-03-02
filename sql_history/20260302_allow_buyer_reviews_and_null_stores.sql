-- ==================== MIGRATION: Allow Buyer Reviews & Null Store Fields ====================
-- Date: 2026-03-02
-- Description:
-- 1. Alters the stores table to allow NULL on shop-specific fields (name, alias, wa_number).
--    This allows users to have a 'stores' record (for instant seller switch) without having an active shop yet.
-- 2. Updates the reviews table to include user_id (for buyers) and rating.
-- 3. Ensures RLS policies allow authenticated users (buyers) to post reviews.

-- ========== 1. Alter stores table to allow NULLs ==========
ALTER TABLE public.stores ALTER COLUMN name DROP NOT NULL;
ALTER TABLE public.stores ALTER COLUMN alias DROP NOT NULL;
ALTER TABLE public.stores ALTER COLUMN wa_number DROP NOT NULL;

-- ========== 2. Update reviews table ==========
-- Add user_id to link to the buyer's account (auth.users)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
-- Add rating column (1-5)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
-- Ensure reviewer_name is nullable if we want to use profile's display_name automatically
ALTER TABLE public.reviews ALTER COLUMN reviewer_name DROP NOT NULL;

-- ========== 3. Update RLS Policies for reviews ==========
-- Ensure anyone can see reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Allow any authenticated user (Buyer) to insert a review
DROP POLICY IF EXISTS "Store owners can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

-- ========== 4. Ensure profiles table structure is verified (from existing trigger usage) ==========
-- Profiles table is assumed to be managed by a handle_new_user() trigger.
-- We ensure the display_name and user_email columns exist for our Index.tsx logic.
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure profiles policies are updated correctly
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
