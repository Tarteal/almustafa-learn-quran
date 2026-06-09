
-- Remove student self-update on enrollments
DROP POLICY IF EXISTS "Enrollments updatable by owner" ON public.enrollments;

-- Remove student self-update on class_requests (teachers/admins still can)
DROP POLICY IF EXISTS "Class requests updatable by owner" ON public.class_requests;

-- Restrict teacher_availability reads to authenticated users
DROP POLICY IF EXISTS "Availability is public" ON public.teacher_availability;
CREATE POLICY "Availability viewable by authenticated"
ON public.teacher_availability FOR SELECT TO authenticated USING (true);

-- Explicit deny for non-admin writes to lesson-materials storage bucket
DROP POLICY IF EXISTS "lesson-materials admin insert" ON storage.objects;
DROP POLICY IF EXISTS "lesson-materials admin update" ON storage.objects;
DROP POLICY IF EXISTS "lesson-materials admin delete" ON storage.objects;

CREATE POLICY "lesson-materials admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lesson-materials admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lesson-materials admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));
