
DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media admin write" ON storage.objects;
CREATE POLICY "media admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "media admin update" ON storage.objects;
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "media admin delete" ON storage.objects;
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
