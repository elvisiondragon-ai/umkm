-- ==================== MIGRATION: Open Orders Read Access for Guest Verification ====================
-- Date: 2026-03-02
-- Description: Drops the strict JWT login requirement for viewing orders.
--              This allows Guest buyers (who are not logged in) to be verified
--              for the "Verified Review" system by allowing the frontend
--              app to query and match their email against the stores_orders table.

-- 1. Remove the restrictive policy that requires login
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.stores_orders;

-- 2. Create an open policy for reading orders so the frontend can verify emails
CREATE POLICY "Anyone can view orders for verification" 
ON public.stores_orders 
FOR SELECT 
USING (true);
