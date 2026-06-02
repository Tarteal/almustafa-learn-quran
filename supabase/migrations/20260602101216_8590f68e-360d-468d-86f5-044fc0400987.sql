DROP POLICY IF EXISTS "Teachers are public" ON public.teachers;
CREATE POLICY "Teachers viewable by authenticated"
  ON public.teachers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lessons are public" ON public.lessons;
CREATE POLICY "Published lessons viewable by authenticated"
  ON public.lessons FOR SELECT TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Materials viewable when published" ON public.lesson_materials;
CREATE POLICY "Materials viewable by enrolled students"
  ON public.lesson_materials FOR SELECT TO authenticated
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.enrollments e ON e.course_id = l.course_id
      WHERE l.id = lesson_materials.lesson_id
        AND e.user_id = auth.uid()
    )
  );