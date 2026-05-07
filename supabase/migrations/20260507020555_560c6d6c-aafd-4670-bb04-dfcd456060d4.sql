
-- Security definer helpers to break RLS recursion between enrollments <-> enrollment_teachers
CREATE OR REPLACE FUNCTION public.teacher_has_enrollment(_enrollment_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollment_teachers et
    JOIN public.teachers t ON t.id = et.teacher_id
    WHERE et.enrollment_id = _enrollment_id AND t.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.user_owns_enrollment(_enrollment_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = _enrollment_id AND e.user_id = auth.uid()
  )
$$;

-- Replace recursive policies
DROP POLICY IF EXISTS "Teachers view assigned enrollments" ON public.enrollments;
CREATE POLICY "Teachers view assigned enrollments"
ON public.enrollments FOR SELECT
USING (public.teacher_has_enrollment(id));

DROP POLICY IF EXISTS "Assignments viewable by enrolled student" ON public.enrollment_teachers;
CREATE POLICY "Assignments viewable by enrolled student"
ON public.enrollment_teachers FOR SELECT
USING (public.user_owns_enrollment(enrollment_id));

-- Same recursion risk on classes & class_requests (they also EXISTS into enrollments)
DROP POLICY IF EXISTS "Classes viewable by enrolled student" ON public.classes;
CREATE POLICY "Classes viewable by enrolled student"
ON public.classes FOR SELECT
USING (public.user_owns_enrollment(enrollment_id));

DROP POLICY IF EXISTS "Class requests insertable by owner" ON public.class_requests;
CREATE POLICY "Class requests insertable by owner"
ON public.class_requests FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.user_owns_enrollment(enrollment_id));
