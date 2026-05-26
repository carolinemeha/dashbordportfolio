-- Lecture publique vitrine (clé anon) — idempotent, aligné sur 010_vitrine_supabase_complete.sql

CREATE TABLE IF NOT EXISTS public.platform_availability (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'busy', 'on_mission')),
  response_minutes SMALLINT NOT NULL DEFAULT 45,
  timezone TEXT NOT NULL DEFAULT 'Africa/Porto-Novo',
  city_fr TEXT NOT NULL DEFAULT 'Cotonou',
  city_en TEXT NOT NULL DEFAULT 'Cotonou',
  work_start_hour SMALLINT NOT NULL DEFAULT 9,
  work_end_hour SMALLINT NOT NULL DEFAULT 18,
  work_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_availability (id, status, response_minutes)
VALUES (1, 'available', 45)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.platform_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'EUR',
  target_currency TEXT NOT NULL,
  rate NUMERIC(18, 8) NOT NULL,
  country_codes TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_exchange_rates_target_idx
  ON public.platform_exchange_rates (target_currency);

INSERT INTO public.platform_exchange_rates (target_currency, rate, country_codes) VALUES
  ('EUR', 1, ARRAY['FR','DE','ES','IT','BE','NL','PT']),
  ('USD', 1.08, ARRAY['US','CA']),
  ('XOF', 655.957, ARRAY['BJ','SN','CI','BF','ML','NE','TG']),
  ('GBP', 0.86, ARRAY['GB']),
  ('CAD', 1.47, ARRAY['CA'])
ON CONFLICT (target_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  country_codes = EXCLUDED.country_codes,
  updated_at = now();

ALTER TABLE public.platform_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_exchange_rates ENABLE ROW LEVEL SECURITY;

DO $vitrine$
BEGIN
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    DROP POLICY IF EXISTS blog_posts_public_read ON public.blog_posts;
    CREATE POLICY blog_posts_public_read ON public.blog_posts
      FOR SELECT TO anon, authenticated USING (published = true);
  END IF;

  IF to_regclass('public.realtime_notifications') IS NOT NULL THEN
    DROP POLICY IF EXISTS realtime_notifications_public_read ON public.realtime_notifications;
    CREATE POLICY realtime_notifications_public_read ON public.realtime_notifications
      FOR SELECT TO anon, authenticated USING (published = true);
  END IF;

  IF to_regclass('public.marketplace_products') IS NOT NULL THEN
    DROP POLICY IF EXISTS marketplace_products_select_anon ON public.marketplace_products;
    CREATE POLICY marketplace_products_select_anon ON public.marketplace_products
      FOR SELECT TO anon, authenticated USING (published = true);
  END IF;

  IF to_regclass('public.platform_changelog') IS NOT NULL THEN
    DROP POLICY IF EXISTS platform_changelog_select_anon ON public.platform_changelog;
    CREATE POLICY platform_changelog_select_anon ON public.platform_changelog
      FOR SELECT TO anon, authenticated USING (published = true);
  END IF;

  IF to_regclass('public.platform_roadmap') IS NOT NULL THEN
    DROP POLICY IF EXISTS platform_roadmap_select_anon ON public.platform_roadmap;
    CREATE POLICY platform_roadmap_select_anon ON public.platform_roadmap
      FOR SELECT TO anon, authenticated USING (published = true);
  END IF;

  IF to_regclass('public.platform_availability') IS NOT NULL THEN
    DROP POLICY IF EXISTS platform_availability_select_anon ON public.platform_availability;
    CREATE POLICY platform_availability_select_anon ON public.platform_availability
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF to_regclass('public.platform_exchange_rates') IS NOT NULL THEN
    DROP POLICY IF EXISTS platform_exchange_rates_select_anon ON public.platform_exchange_rates;
    CREATE POLICY platform_exchange_rates_select_anon ON public.platform_exchange_rates
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF to_regclass('public.testimonials') IS NOT NULL THEN
    DROP POLICY IF EXISTS portfolio_public_select_testimonials ON public.testimonials;
    CREATE POLICY portfolio_public_select_testimonials ON public.testimonials
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF to_regclass('public.certifications') IS NOT NULL THEN
    DROP POLICY IF EXISTS portfolio_public_select_certifications ON public.certifications;
    CREATE POLICY portfolio_public_select_certifications ON public.certifications
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END;
$vitrine$;
