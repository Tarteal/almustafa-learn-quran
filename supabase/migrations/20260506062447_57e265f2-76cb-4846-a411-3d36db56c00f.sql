CREATE POLICY "Teachers insert own classes"
ON public.classes
FOR INSERT
WITH CHECK (
  is_teacher_of(teacher_id)
  AND EXISTS (
    SELECT 1 FROM public.enrollment_teachers et
    WHERE et.enrollment_id = classes.enrollment_id
      AND et.teacher_id = classes.teacher_id
  )
);