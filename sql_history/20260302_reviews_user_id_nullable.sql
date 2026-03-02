-- ==================== MIGRATION: Allow Guest Reviews ====================
-- Date: 2026-03-02
-- Description: Drops the NOT NULL constraint on user_id in stores_reviews
--              so that verified buyers who are not logged in can still 
--              submit reviews based on their verified customer_email.

ALTER TABLE public.stores_reviews ALTER COLUMN user_id DROP NOT NULL;
