-- ==================== MIGRATION: Allow Buyers to View Own Orders ====================
-- Date: 2026-03-02
-- Description: Adds an RLS policy that allows authenticated users to view orders
--              where their login email matches the customer_email on the order.
--              This is required for the "Riwayat Belanja Saya" (My Purchases) 
--              buyer dashboard to work.

-- Drop the policy if it already exists to prevent duplicate errors
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.stores_orders;

-- Create the policy: Users can SELECT rows where their JWT email matches the customer_email
CREATE POLICY "Buyers can view their own orders" 
ON public.stores_orders 
FOR SELECT 
USING (customer_email = auth.jwt() ->> 'email');
