
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS attendance TEXT NOT NULL DEFAULT 'unmarked'
    CHECK (attendance IN ('unmarked','present','absent','late')),
  ADD COLUMN IF NOT EXISTS attendance_note TEXT,
  ADD COLUMN IF NOT EXISTS attendance_marked_at TIMESTAMPTZ;
