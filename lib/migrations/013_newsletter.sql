-- Copie admin : exécuter sur Supabase si pas encore appliqué (voir Myporfolio/supabase/migrations/013_newsletter.sql)

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr', 'en')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT NOT NULL DEFAULT 'footer',
  consent BOOLEAN NOT NULL DEFAULT true,
  unsub_token TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_idx
  ON public.newsletter_subscribers (lower(trim(email)));

CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON public.newsletter_subscribers (status, subscribed_at DESC);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS newsletter_subscribers_service ON public.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_service ON public.newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');
