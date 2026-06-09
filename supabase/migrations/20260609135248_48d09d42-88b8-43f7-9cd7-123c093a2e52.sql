-- Fix teacher contact exposure: remove broad teacher read access and scope it to authorized viewers only.
DROP POLICY IF EXISTS "Teachers viewable by authenticated" ON public.teachers;

CREATE POLICY "Teachers viewable by authorized users"
ON public.teachers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR user_id = auth.uid()
  OR (
    public.is_approved(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.enrollment_teachers et
      JOIN public.enrollments e ON e.id = et.enrollment_id
      WHERE et.teacher_id = teachers.id
        AND e.user_id = auth.uid()
    )
  )
);

-- Allow administrators to review all class requests.
CREATE POLICY "Admins can view all class requests"
ON public.class_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict lesson catalogue access to enrolled, approved students and administrators.
DROP POLICY IF EXISTS "Published lessons viewable by authenticated" ON public.lessons;

CREATE POLICY "Published lessons viewable by approved enrolled students"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (
    is_published = true
    AND public.is_approved(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
        AND e.user_id = auth.uid()
    )
  )
);

-- Restrict teacher schedule visibility to approved assigned students, admins, and the teacher themself.
DROP POLICY IF EXISTS "Availability viewable by authenticated" ON public.teacher_availability;

CREATE POLICY "Availability viewable by authorized users"
ON public.teacher_availability
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.is_teacher_of(teacher_id)
  OR (
    public.is_approved(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.enrollment_teachers et
      JOIN public.enrollments e ON e.id = et.enrollment_id
      WHERE et.teacher_id = teacher_availability.teacher_id
        AND e.user_id = auth.uid()
    )
  )
);

-- The approval helper is only needed for signed-in users and service/admin code.
REVOKE EXECUTE ON FUNCTION public.is_approved(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_approved(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_approved(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved(uuid) TO service_role;