
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS topics TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience INT;

CREATE TABLE public.teacher_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability is public" ON public.teacher_availability FOR SELECT USING (true);
CREATE INDEX idx_avail_teacher_day ON public.teacher_availability(teacher_id, day_of_week);

-- Backfill topics + experience
UPDATE public.teachers SET topics = ARRAY['Tajweed','Hifz','Ijazah','Quran Reading'], years_experience = 12
  WHERE full_name = 'Sheikh Abdullah Al-Masri';
UPDATE public.teachers SET topics = ARRAY['Noorani Qaida','Quran Reading','Kids Learning'], years_experience = 8
  WHERE full_name = 'Ustadh Bilal Khan';
UPDATE public.teachers SET topics = ARRAY['Tajweed','Tafseer','Sisters Classes','Kids Learning'], years_experience = 10
  WHERE full_name = 'Sheikha Maryam Hassan';

-- Sample weekly availability (Mon-Fri, two windows) for each existing teacher
INSERT INTO public.teacher_availability (teacher_id, day_of_week, start_time, end_time, timezone)
SELECT t.id, d.dow, w.start_t::time, w.end_t::time, 'UTC'
FROM public.teachers t
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS d(dow)
CROSS JOIN (VALUES ('09:00','12:00'), ('15:00','19:00')) AS w(start_t, end_t);
