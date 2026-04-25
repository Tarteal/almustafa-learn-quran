
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  level TEXT,
  price_monthly NUMERIC,
  plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses are public" ON public.courses FOR SELECT USING (true);

INSERT INTO public.courses (slug, title, description, duration, level, price_monthly, plan) VALUES
('noorani-qaida', 'Noorani Qaida', 'Master Arabic letters, pronunciation, and basic rules.', '2-4 mo', 'beginner', 45, 'basic'),
('quran-reading', 'Quran Reading (Nazra)', 'Read the Quran fluently with correct pronunciation.', '6-12 mo', 'beginner', 45, 'basic'),
('tajweed', 'Tajweed Course', 'Master rules of recitation - Madd, Ghunna, Idgham.', '8-14 mo', 'intermediate', 75, 'standard'),
('hifz', 'Hifz Program', 'Memorize the entire Quran with structured plan.', '3-5 yr', 'advanced', 120, 'premium'),
('tafseer', 'Tafseer Course', 'Understand the meaning and lessons of the Quran.', '12+ mo', 'advanced', 120, 'premium');

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrollments viewable by owner" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enrollments insertable by owner" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enrollments updatable by owner" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
