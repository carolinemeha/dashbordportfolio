-- Aligné sur Myporfolio/supabase/migrations/011_testimonials_vitrine.sql
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS testimonials_vitrine_idx
  ON public.testimonials (published, sort_order DESC, created_at DESC);
