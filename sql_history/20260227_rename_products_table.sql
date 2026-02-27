-- ==================== MIGRATION: Rename products to stores_product ====================
-- Date: 2026-02-27
-- Description: Renames the "products" table to "stores_product" to avoid mismatch/confusion.

-- 1. Rename the table
ALTER TABLE public.products RENAME TO stores_product;

-- 2. Update the RLS Policy Names (Optional but good for clarity)
ALTER POLICY "Anyone can view products" ON public.stores_product RENAME TO "Anyone can view stores_product";
ALTER POLICY "Store owners can create products" ON public.stores_product RENAME TO "Store owners can create stores_product";
ALTER POLICY "Store owners can update products" ON public.stores_product RENAME TO "Store owners can update stores_product";
ALTER POLICY "Store owners can delete products" ON public.stores_product RENAME TO "Store owners can delete stores_product";
