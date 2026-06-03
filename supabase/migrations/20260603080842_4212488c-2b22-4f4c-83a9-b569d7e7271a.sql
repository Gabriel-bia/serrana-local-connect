CREATE TABLE public.whatsapp_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_clicks_store_id ON public.whatsapp_clicks(store_id);
CREATE INDEX idx_whatsapp_clicks_clicked_at ON public.whatsapp_clicks(clicked_at DESC);

GRANT INSERT ON public.whatsapp_clicks TO anon, authenticated;
GRANT ALL ON public.whatsapp_clicks TO service_role;

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert clicks"
  ON public.whatsapp_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);