
-- Add publish flag to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

-- Lesson materials table
CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('video','pdf','audio','link')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON public.lesson_materials(lesson_id, order_index);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials viewable when published"
ON public.lesson_materials FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins view all materials"
ON public.lesson_materials FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert materials"
ON public.lesson_materials FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update materials"
ON public.lesson_materials FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete materials"
ON public.lesson_materials FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER lesson_materials_updated_at
BEFORE UPDATE ON public.lesson_materials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for lesson materials (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-materials', 'lesson-materials', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lesson materials are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-materials');

CREATE POLICY "Admins upload lesson materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update lesson materials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete lesson materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-materials' AND has_role(auth.uid(), 'admin'::app_role));
