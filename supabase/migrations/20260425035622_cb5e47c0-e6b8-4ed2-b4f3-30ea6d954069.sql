
CREATE OR REPLACE FUNCTION public.handle_new_enrollment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  picked_teacher UUID;
BEGIN
  SELECT id INTO picked_teacher
  FROM public.teachers
  ORDER BY (SELECT COUNT(*) FROM public.enrollment_teachers et WHERE et.teacher_id = teachers.id) ASC, random()
  LIMIT 1;

  IF picked_teacher IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.enrollment_teachers (enrollment_id, teacher_id)
  VALUES (NEW.id, picked_teacher)
  ON CONFLICT (enrollment_id) DO NOTHING;

  INSERT INTO public.classes (enrollment_id, teacher_id, starts_at, duration_min, meeting_url, status)
  VALUES
    (NEW.id, picked_teacher, date_trunc('hour', now()) + interval '1 day' + interval '17 hours', 30,
     'https://meet.almustafa.academy/' || substr(NEW.id::text, 1, 8), 'scheduled'),
    (NEW.id, picked_teacher, date_trunc('hour', now()) + interval '3 days' + interval '17 hours', 30,
     'https://meet.almustafa.academy/' || substr(NEW.id::text, 1, 8), 'scheduled');

  RETURN NEW;
END; $$;

CREATE TRIGGER on_enrollment_created
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.handle_new_enrollment();
