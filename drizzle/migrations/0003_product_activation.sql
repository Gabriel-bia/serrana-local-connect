ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
-- Existing admin ALL policy retains authenticated admin access to inactive products.
