ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS starts_at timestamptz;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS ends_at timestamptz;