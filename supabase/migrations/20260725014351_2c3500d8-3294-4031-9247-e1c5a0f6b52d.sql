ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price numeric NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_original_price ON public.products (original_price) WHERE original_price IS NOT NULL;