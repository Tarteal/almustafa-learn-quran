
REVOKE EXECUTE ON FUNCTION public.teacher_has_enrollment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_owns_enrollment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.teacher_has_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_enrollment(uuid) TO authenticated;
