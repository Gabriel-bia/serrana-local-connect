
-- =========================================================
-- ROLES & has_role
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- First signed-up user is auto-promoted to admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS bootstrap_first_admin_trg ON auth.users;
CREATE TRIGGER bootstrap_first_admin_trg
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- =========================================================
-- updated_at helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =========================================================
-- Helper macro pattern: we repeat GRANT + RLS + policies
-- Public catalog: anyone can SELECT; only admins can write.
-- =========================================================

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read categories" ON public.categories;
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write categories" ON public.categories;
CREATE POLICY "admins write categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_categories ON public.categories;
CREATE TRIGGER touch_categories BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- service_categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read scats" ON public.service_categories;
CREATE POLICY "public read scats" ON public.service_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write scats" ON public.service_categories;
CREATE POLICY "admins write scats" ON public.service_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_scats ON public.service_categories;
CREATE TRIGGER touch_scats BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- banners
CREATE TABLE IF NOT EXISTS public.banners (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read banners" ON public.banners;
CREATE POLICY "public read banners" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write banners" ON public.banners;
CREATE POLICY "admins write banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_banners ON public.banners;
CREATE TRIGGER touch_banners BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- stores
CREATE TABLE IF NOT EXISTS public.stores (
  id text PRIMARY KEY,
  name text NOT NULL,
  logo text NOT NULL DEFAULT '',
  banner text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category_id text,
  whatsapp text NOT NULL DEFAULT '',
  instagram text,
  address text,
  featured boolean NOT NULL DEFAULT false,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read stores" ON public.stores;
CREATE POLICY "public read stores" ON public.stores FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write stores" ON public.stores;
CREATE POLICY "admins write stores" ON public.stores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_stores ON public.stores;
CREATE TRIGGER touch_stores BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  image text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  category_id text,
  store_id text,
  external_link text,
  whatsapp text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write products" ON public.products;
CREATE POLICY "admins write products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_products ON public.products;
CREATE TRIGGER touch_products BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- services (services offered by stores)
CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  name text NOT NULL,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  store_id text,
  whatsapp text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read services" ON public.services;
CREATE POLICY "public read services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write services" ON public.services;
CREATE POLICY "admins write services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_services ON public.services;
CREATE TRIGGER touch_services BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- providers
CREATE TABLE IF NOT EXISTS public.providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  photo text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  phone text,
  city text,
  service_area text,
  instagram text,
  facebook text,
  schedule text,
  category_ids text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read providers" ON public.providers;
CREATE POLICY "public read providers" ON public.providers FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write providers" ON public.providers;
CREATE POLICY "admins write providers" ON public.providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_providers ON public.providers;
CREATE TRIGGER touch_providers BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- provider_services
CREATE TABLE IF NOT EXISTS public.provider_services (
  id text PRIMARY KEY,
  provider_id text,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric,
  image text NOT NULL DEFAULT '',
  category_id text,
  duration text,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_services TO authenticated;
GRANT ALL ON public.provider_services TO service_role;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read psvc" ON public.provider_services;
CREATE POLICY "public read psvc" ON public.provider_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write psvc" ON public.provider_services;
CREATE POLICY "admins write psvc" ON public.provider_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_psvc ON public.provider_services;
CREATE TRIGGER touch_psvc BEFORE UPDATE ON public.provider_services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- provider_works
CREATE TABLE IF NOT EXISTS public.provider_works (
  id text PRIMARY KEY,
  provider_id text,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_works TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_works TO authenticated;
GRANT ALL ON public.provider_works TO service_role;
ALTER TABLE public.provider_works ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read pworks" ON public.provider_works;
CREATE POLICY "public read pworks" ON public.provider_works FOR SELECT USING (true);
DROP POLICY IF EXISTS "admins write pworks" ON public.provider_works;
CREATE POLICY "admins write pworks" ON public.provider_works FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS touch_pworks ON public.provider_works;
CREATE TRIGGER touch_pworks BEFORE UPDATE ON public.provider_works
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- Realtime
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'categories','service_categories','banners','stores','products',
    'services','providers','provider_services','provider_works'
  ])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
  END LOOP;
END $$;
