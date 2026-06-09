CREATE TABLE public.teacher_contacts (
  teacher_id uuid PRIMARY KEY REFERENCES public.teachers(id) ON DELETE CASCADE,
  email text,
  whatsapp text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_contacts TO authenticated;
GRANT ALL ON public.teacher_contacts TO service_role;

ALTER TABLE public.teacher_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage teacher contacts"
ON public.teacher_contacts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Teachers can view own contact details"
ON public.teacher_contacts
FOR SELECT
TO authenticated
USING (public.is_teacher_of(teacher_id));

CREATE POLICY "Teachers can update own contact details"
ON public.teacher_contacts
FOR UPDATE
TO authenticated
USING (public.is_teacher_of(teacher_id))
WITH CHECK (public.is_teacher_of(teacher_id));

INSERT INTO public.teacher_contacts (teacher_id, email, whatsapp)
SELECT id, email, whatsapp
FROM public.teachers
WHERE email IS NOT NULL OR whatsapp IS NOT NULL
ON CONFLICT (teacher_id) DO UPDATE
SET email = EXCLUDED.email,
    whatsapp = EXCLUDED.whatsapp,
    updated_at = now();

CREATE TRIGGER teacher_contacts_updated_at
BEFORE UPDATE ON public.teacher_contacts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.teachers
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS whatsapp;

DROP POLICY IF EXISTS "Teachers viewable by authorized users" ON public.teachers;

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

DROP POLICY IF EXISTS "Class requests insertable by owner" ON public.class_requests;

CREATE POLICY "Class requests insertable by approved owner"
ON public.class_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.is_approved(auth.uid())
  AND public.user_owns_enrollment(enrollment_id)
);