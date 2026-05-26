-- Aligné sur Myporfolio/supabase/migrations/012_testimonial_vitrine_submit.sql
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin';

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS submitter_email TEXT;

DO $chk$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'testimonials_source_check'
      AND conrelid = 'public.testimonials'::regclass
  ) THEN
    ALTER TABLE public.testimonials
      ADD CONSTRAINT testimonials_source_check
      CHECK (source IN ('admin', 'vitrine'));
  END IF;
END;
$chk$;

CREATE INDEX IF NOT EXISTS testimonials_pending_vitrine_idx
  ON public.testimonials (created_at DESC)
  WHERE source = 'vitrine' AND published = false;
