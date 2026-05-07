ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Existing users (created before this feature) auto-approved
UPDATE public.profiles SET approval_status = 'approved', approved_at = now()
WHERE approval_status = 'pending'
  AND (id IN (SELECT user_id FROM public.user_roles) OR created_at < now() - interval '1 minute');

-- Allow users to read their own approval_status (already covered by existing select policy)
-- No new policy needed since admins update/select policies exist.
