
-- Helper: is current user approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND approval_status = 'approved'
  )
$$;

-- Tighten enrollment INSERT to approved users (admins can still insert via their own admin policies elsewhere)
DROP POLICY IF EXISTS "Enrollments insertable by owner" ON public.enrollments;
CREATE POLICY "Enrollments insertable by approved owner"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
);

-- Tighten lesson_materials SELECT to approved enrolled students
DROP POLICY IF EXISTS "Materials viewable by enrolled students" ON public.lesson_materials;
CREATE POLICY "Materials viewable by approved enrolled students"
ON public.lesson_materials
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND public.is_approved(auth.uid())
  AND EXISTS (
    SELECT 1
    FROM lessons l
    JOIN enrollments e ON e.course_id = l.course_id
    WHERE l.id = lesson_materials.lesson_id
      AND e.user_id = auth.uid()
  )
);

-- Meeting URL validation: only http(s) or NULL
ALTER TABLE public.classes
  DROP CONSTRAINT IF EXISTS classes_meeting_url_http_only;
ALTER TABLE public.classes
  ADD CONSTRAINT classes_meeting_url_http_only
  CHECK (meeting_url IS NULL OR meeting_url ~* '^https?://');
