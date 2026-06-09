-- Move privileged helper logic behind private functions so exposed public functions are not SECURITY DEFINER.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.user_owns_enrollment(_enrollment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.id = _enrollment_id
      AND e.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.user_owns_enrollment(_enrollment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.user_owns_enrollment(_enrollment_id)
$$;

CREATE OR REPLACE FUNCTION private.is_teacher_of(_teacher_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teachers
    WHERE id = _teacher_id
      AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of(_teacher_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_teacher_of(_teacher_id)
$$;

CREATE OR REPLACE FUNCTION private.current_teacher_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.teachers
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.current_teacher_id()
$$;

CREATE OR REPLACE FUNCTION private.teacher_has_enrollment(_enrollment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollment_teachers et
    JOIN public.teachers t ON t.id = et.teacher_id
    WHERE et.enrollment_id = _enrollment_id
      AND t.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.teacher_has_enrollment(_enrollment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.teacher_has_enrollment(_enrollment_id)
$$;

CREATE OR REPLACE FUNCTION private.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = _user_id
        AND approval_status = 'approved'
    )
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_approved(_user_id)
$$;

-- Grant RLS/app access to non-exposed internal helpers and public wrappers.
GRANT EXECUTE ON FUNCTION private.user_owns_enrollment(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_teacher_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_teacher_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.teacher_has_enrollment(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_approved(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_owns_enrollment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_teacher_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.teacher_has_enrollment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_approved(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.user_owns_enrollment(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_teacher_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_has_enrollment(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_approved(uuid) TO authenticated, service_role;