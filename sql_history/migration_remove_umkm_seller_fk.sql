-- Migration: Change stores.user_id FK from umkm_seller to auth.users
-- Run this in Supabase SQL Editor
-- Date: 27 Feb 2026
-- Safe: Does NOT touch profiles table or handle_new_user trigger

-- Step 1: Drop old FK constraint (stores → umkm_seller)
ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_user_id_fkey;

-- Step 2: Add new FK constraint (stores → auth.users)
ALTER TABLE public.stores
  ADD CONSTRAINT stores_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Drop RLS policies on umkm_seller (no longer needed for new registrations)
-- Keeping the table itself intact to preserve any existing data
DROP POLICY IF EXISTS "Users can view own profile" ON public.umkm_seller;
DROP POLICY IF EXISTS "Users can update own profile" ON public.umkm_seller;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.umkm_seller;

-- Done! The handle_new_user() trigger on auth.users will auto-create profiles rows.
-- The stores table now references auth.users directly.
