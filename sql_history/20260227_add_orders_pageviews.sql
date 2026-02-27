-- ==================== MIGRATION: Add Orders & Page Views ====================
-- Date: 2026-02-27
-- Description: Adds orders table for real revenue/order tracking,
--              page_views table for visitor counting,
--              and capi/pixel columns to stores.

-- ========== 1. Add capi & pixel columns to stores ==========
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS capi TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS pixel TEXT;

-- ========== 2. Create orders table ==========
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_wa TEXT,
    customer_address TEXT,
    items TEXT NOT NULL,           -- JSON string or text summary of items ordered
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, cancelled
    payment_method TEXT DEFAULT 'cod',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS Policies
CREATE POLICY "Anyone can insert orders (buyers)" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owners can view their orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "Store owners can update their orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "Store owners can delete their orders" ON public.orders FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);

-- ========== 3. Create page_views table ==========
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Page Views RLS Policies
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Store owners can view their page views" ON public.page_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);

-- ========== 4. Storage Policy for Stores bucket ==========
-- Make sure the "Stores" bucket exists and has the right policies.
-- Run this only if not already configured:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('Stores', 'Stores', true) ON CONFLICT DO NOTHING;
