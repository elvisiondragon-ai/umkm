-- ==================== UMKM SCHEMA ====================
-- Auth handled by existing handle_new_user() trigger on auth.users
-- which auto-creates a row in public.profiles on signup.
-- No separate seller table needed.

-- Table: public.umkm_seller (DEPRECATED - kept for legacy data)
-- New registrations no longer use this table.
-- CREATE TABLE IF NOT EXISTS public.umkm_seller (...);

-- Table: public.stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT,
    theme_color TEXT DEFAULT '#1E3A5F',
    wa_number TEXT NOT NULL,
    address TEXT,
    payment_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;


-- Table: public.products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- Table: public.reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;


-- ==================== ROW LEVEL SECURITY (RLS) POLICIES ====================

-- STORES
CREATE POLICY "Anyone can view stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Users can create their own store" ON public.stores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own store" ON public.stores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own store" ON public.stores FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Store owners can create products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "Store owners can update products" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "Store owners can delete products" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);

-- REVIEWS
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Store owners can insert reviews" ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "Store owners can delete reviews" ON public.reviews FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND user_id = auth.uid())
);
