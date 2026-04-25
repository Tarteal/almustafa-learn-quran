CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.class_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  original_class_id UUID,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 30,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class requests viewable by owner"
ON public.class_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Class requests insertable by owner"
ON public.class_requests FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.enrollments e WHERE e.id = enrollment_id AND e.user_id = auth.uid()
));

CREATE POLICY "Class requests updatable by owner"
ON public.class_requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_class_requests_updated_at
BEFORE UPDATE ON public.class_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_class_requests_user ON public.class_requests(user_id);
CREATE INDEX idx_class_requests_enrollment ON public.class_requests(enrollment_id);