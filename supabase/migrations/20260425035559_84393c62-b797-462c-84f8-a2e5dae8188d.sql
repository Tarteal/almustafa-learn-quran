
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  bio TEXT,
  country TEXT,
  specialization TEXT,
  email TEXT,
  whatsapp TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers are public" ON public.teachers FOR SELECT USING (true);

CREATE TABLE public.enrollment_teachers (
  enrollment_id UUID PRIMARY KEY REFERENCES public.enrollments(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enrollment_teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by enrolled student"
  ON public.enrollment_teachers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_id AND e.user_id = auth.uid()));

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL DEFAULT 30,
  meeting_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes viewable by enrolled student"
  ON public.classes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_id AND e.user_id = auth.uid()));
CREATE INDEX idx_classes_enrollment_starts ON public.classes(enrollment_id, starts_at);

-- Seed sample teachers
INSERT INTO public.teachers (full_name, bio, country, specialization, email, whatsapp) VALUES
('Sheikh Abdullah Al-Masri', 'Ijazah-holding Egyptian scholar with 12+ years teaching Tajweed and Hifz worldwide.', 'Egypt', 'Tajweed & Hifz', 'abdullah@almustafa.academy', '+201234567890'),
('Ustadh Bilal Khan', 'Pakistani Hafiz specializing in Noorani Qaida and Quran reading for beginners and kids.', 'Pakistan', 'Qaida & Nazra', 'bilal@almustafa.academy', '+923001234567'),
('Sheikha Maryam Hassan', 'Female Egyptian scholar dedicated to teaching sisters and children with warmth and patience.', 'Egypt', 'Tajweed & Tafseer', 'maryam@almustafa.academy', '+201112223344');

-- Assign a teacher to each existing enrollment (round-robin by row order)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS rn
  FROM public.enrollments
),
tch AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS rn,
         (SELECT COUNT(*) FROM public.teachers) AS total
  FROM public.teachers
)
INSERT INTO public.enrollment_teachers (enrollment_id, teacher_id)
SELECT r.id, t.id
FROM ranked r
JOIN tch t ON t.rn = (r.rn % t.total)
ON CONFLICT (enrollment_id) DO NOTHING;

-- Seed two upcoming classes per enrollment
INSERT INTO public.classes (enrollment_id, teacher_id, starts_at, duration_min, meeting_url, status)
SELECT et.enrollment_id, et.teacher_id,
       date_trunc('hour', now()) + (offset_days || ' days')::interval + interval '17 hours',
       30,
       'https://meet.almustafa.academy/' || substr(et.enrollment_id::text, 1, 8),
       'scheduled'
FROM public.enrollment_teachers et
CROSS JOIN (VALUES (1), (3)) AS days(offset_days);
