-- Extensions portfolio « SaaS » : analytics présence / impressions, leads, onboarding, suivi.
-- À exécuter sur la base Supabase (SQL Editor).
-- Lecture/écriture côté appli uniquement via la clé service (routes API Next).

-- ─── Présence « live » (heartbeat client) ───
CREATE TABLE IF NOT EXISTS public.visitor_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_public_id TEXT NOT NULL UNIQUE,
  last_path TEXT,
  country_code TEXT,
  user_agent_hint TEXT,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_presence_last_seen_idx ON public.visitor_presence (last_seen DESC);

-- ─── Vue projet (carte portfolio) ───
CREATE TABLE IF NOT EXISTS public.project_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  session_public_id TEXT,
  country_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_impressions_proj_time_idx ON public.project_impressions (project_id, created_at DESC);

-- ─── Clique / exposition techno (badge, liste) ───
CREATE TABLE IF NOT EXISTS public.tech_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_name TEXT NOT NULL,
  source TEXT,
  session_public_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tech_impressions_name_time_idx ON public.tech_impressions (tech_name, created_at DESC);

-- ─── Enrichissement page_views (colonnes facultatives) ───
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS session_public_id TEXT;

-- ─── Devis & réservation ───
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  needs_summary TEXT,
  budget_range TEXT,
  services_hint TEXT[],
  ai_estimate JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'fr',
  email TEXT NOT NULL,
  name TEXT,
  timezone_hint TEXT,
  preferred_slots TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ─── Onboarding client (parcours wizard) ───
CREATE TABLE IF NOT EXISTS public.client_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  locale TEXT,
  step_completed INTEGER NOT NULL DEFAULT 0,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ─── Suivi projet (lien opaque partagé) ───
CREATE TABLE IF NOT EXISTS public.client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'discovery',
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes_internal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.client_projects.access_token IS 'Jeton opaque affiché / envoyé au client pour consulter le suivi (sans compte Supabase Auth).';

-- ─── Conversation IA (persist optionnelle) ───
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_public_id TEXT,
  locale TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_sessions_session_time_idx ON public.ai_chat_sessions (session_public_id, created_at);

-- ─── RLS : pas d’accès direct anon sur ces tables ; API = service_role ───
ALTER TABLE public.visitor_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Politique facultative lecture suivi projet par token uniquement :
-- À activer uniquement avec une fonction SECURITY DEFINER si tu exposes la vitrine anon plus tard.
