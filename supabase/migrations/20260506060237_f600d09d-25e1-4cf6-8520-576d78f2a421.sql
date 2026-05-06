
-- 1. Add teacher to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- 2. Link teachers to auth users
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);

-- 3. Helper: is the current user the teacher for this teacher_id?
CREATE OR REPLACE FUNCTION public.is_teacher_of(_teacher_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE id = _teacher_id AND user_id = auth.uid()
  )
$$;

-- 4. Helper: get the teacher.id for the current logged-in user (or null)
CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1
$$;

-- 5. Teachers can update their own profile row
CREATE POLICY "Teachers update own row"
ON public.teachers FOR UPDATE
USING (user_id = auth.uid());

-- 6. Classes: teachers can view + update classes they teach
CREATE POLICY "Teachers view own classes"
ON public.classes FOR SELECT
USING (public.is_teacher_of(teacher_id));

CREATE POLICY "Teachers update own classes"
ON public.classes FOR UPDATE
USING (public.is_teacher_of(teacher_id));

-- 7. Enrollment_teachers: teachers can see their assignments
CREATE POLICY "Teachers view own assignments"
ON public.enrollment_teachers FOR SELECT
USING (public.is_teacher_of(teacher_id));

-- 8. Enrollments: teachers can see enrollments assigned to them
CREATE POLICY "Teachers view assigned enrollments"
ON public.enrollments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.enrollment_teachers et
  WHERE et.enrollment_id = enrollments.id
    AND public.is_teacher_of(et.teacher_id)
));

-- 9. Profiles: teachers can see profiles of students they teach
CREATE POLICY "Teachers view assigned student profiles"
ON public.profiles FOR SELECT
USING (EXISTS (
  SELECT 1
  FROM public.enrollments e
  JOIN public.enrollment_teachers et ON et.enrollment_id = e.id
  WHERE e.user_id = profiles.id
    AND public.is_teacher_of(et.teacher_id)
));

-- 10. Class requests: teachers can view + update requests for them
CREATE POLICY "Teachers view own class requests"
ON public.class_requests FOR SELECT
USING (public.is_teacher_of(teacher_id));

CREATE POLICY "Teachers update own class requests"
ON public.class_requests FOR UPDATE
USING (public.is_teacher_of(teacher_id));
