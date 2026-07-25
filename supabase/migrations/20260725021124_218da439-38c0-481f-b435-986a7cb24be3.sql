
CREATE TABLE public.store_categories (
  id TEXT NOT NULL PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX store_categories_store_id_idx ON public.store_categories(store_id, position);

GRANT SELECT ON public.store_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_categories TO authenticated;
GRANT ALL ON public.store_categories TO service_role;

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read store_categories" ON public.store_categories FOR SELECT USING (true);
CREATE POLICY "admins write store_categories" ON public.store_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER store_categories_touch_updated_at BEFORE UPDATE ON public.store_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.products ADD COLUMN store_category_id TEXT REFERENCES public.store_categories(id) ON DELETE SET NULL;
CREATE INDEX products_store_category_id_idx ON public.products(store_category_id);
