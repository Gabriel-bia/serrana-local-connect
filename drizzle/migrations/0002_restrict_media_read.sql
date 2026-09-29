DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media staff read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));