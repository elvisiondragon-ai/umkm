-- Migration: Add alias change tracking to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS alias_change_count INTEGER DEFAULT 0;

-- Optional: Update existing stores to 0 if needed (redundant due to DEFAULT)
-- UPDATE public.stores SET alias_change_count = 0 WHERE alias_change_count IS NULL;
