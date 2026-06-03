DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.whatsapp_clicks;

CREATE POLICY "Public can log clicks with valid store"
  ON public.whatsapp_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(store_id) BETWEEN 1 AND 100
    AND length(store_name) BETWEEN 1 AND 255
  );