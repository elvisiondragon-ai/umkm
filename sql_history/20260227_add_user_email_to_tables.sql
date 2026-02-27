-- ==================== MIGRATION: Add user_email to stores_product and stores ====================
-- Date: 2026-02-27
-- Description: Adds a user_email column for easier identification of the owner
--              since Supabase Auth uses a separate auth.users table.

-- 1. Add user_email to stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 2. Add user_email to stores_product
ALTER TABLE public.stores_product ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 3. (Optional but recommended) Backfill existing data if any
UPDATE public.stores s
SET user_email = u.email
FROM auth.users u
WHERE s.user_id = u.id AND s.user_email IS NULL;

UPDATE public.stores_product p
SET user_email = s.user_email
FROM public.stores s
WHERE p.store_id = s.id AND p.user_email IS NULL;
