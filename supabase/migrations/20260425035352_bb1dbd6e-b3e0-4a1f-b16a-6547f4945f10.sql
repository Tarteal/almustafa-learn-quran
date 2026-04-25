
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  order_index INT NOT NULL DEFAULT 0,
  duration_min INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are public" ON public.lessons FOR SELECT USING (true);
CREATE INDEX idx_lessons_course ON public.lessons(course_id, order_index);

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progress viewable by owner" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Progress insertable by owner" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Progress deletable by owner" ON public.lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- Seed 6 lessons per existing course
WITH titles AS (
  SELECT c.id AS course_id, c.slug, t.title, t.summary, t.idx
  FROM public.courses c
  CROSS JOIN LATERAL (
    VALUES
      (1, 'Introduction & Intentions', 'Set your niyyah and overview the course path.'),
      (2, 'Foundations', 'Core concepts you need before moving forward.'),
      (3, 'Practice Session 1', 'Apply what you learned with guided practice.'),
      (4, 'Deep Dive', 'Go deeper into the rules and their applications.'),
      (5, 'Practice Session 2', 'Strengthen your skills with extended practice.'),
      (6, 'Review & Assessment', 'Recap, assessment, and next steps.')
  ) AS t(idx, title, summary)
)
INSERT INTO public.lessons (course_id, title, summary, order_index, duration_min)
SELECT course_id, title, summary, idx, 30 FROM titles;
