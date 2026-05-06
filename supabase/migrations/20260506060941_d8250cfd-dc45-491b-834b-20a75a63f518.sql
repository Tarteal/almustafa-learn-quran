
-- Revoke public execute on SECURITY DEFINER functions; RLS still uses them internally
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.current_teacher_id() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_enrollment() FROM anon, authenticated, public;

-- Restrict listing on public lesson-materials bucket: only admins can list objects;
-- public can still read individual files via public URL.
DROP POLICY IF EXISTS "Public can list lesson-materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read lesson-materials" ON storage.objects;

CREATE POLICY "Admins manage lesson-materials"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'lesson-materials' AND public.has_role(auth.uid(), 'admin'));
