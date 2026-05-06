DROP POLICY IF EXISTS "Lesson materials are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete lesson materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins update lesson materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload lesson materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage lesson-materials" ON storage.objects;

CREATE POLICY "Admins manage lesson materials"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'::public.app_role));