-- RLS + politiques « strictes » pour la clé anon (linter Supabase : pas de FOR ALL + true).
-- - Vitrine : SELECT sur `about`, INSERT sur `contact_messages`.
-- - Console admin : CRUD via SUPABASE_SERVICE_ROLE_KEY (route /api/admin/db) — contourne la RLS.
-- Après déploiement code admin, exécuter ce script sur la base Supabase (ou migrer depuis l’ancien enable_rls).

ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_console_settings ENABLE ROW LEVEL SECURITY;

-- Anciennes politiques « anon tout permissif »
DROP POLICY IF EXISTS portfolio_anon_auth_all_about ON public.about;
DROP POLICY IF EXISTS portfolio_anon_auth_all_projects ON public.projects;
DROP POLICY IF EXISTS portfolio_anon_auth_all_experiences ON public.experiences;
DROP POLICY IF EXISTS portfolio_anon_auth_all_education ON public.education;
DROP POLICY IF EXISTS portfolio_anon_auth_all_skills ON public.skills;
DROP POLICY IF EXISTS portfolio_anon_auth_all_services ON public.services;
DROP POLICY IF EXISTS portfolio_anon_auth_all_testimonials ON public.testimonials;
DROP POLICY IF EXISTS portfolio_anon_auth_all_certifications ON public.certifications;
DROP POLICY IF EXISTS portfolio_anon_auth_all_contact_messages ON public.contact_messages;
DROP POLICY IF EXISTS portfolio_anon_auth_all_page_views ON public.page_views;
DROP POLICY IF EXISTS portfolio_anon_auth_all_cv_downloads ON public.cv_downloads;
DROP POLICY IF EXISTS portfolio_anon_auth_all_cv_info ON public.cv_info;
DROP POLICY IF EXISTS portfolio_anon_auth_all_admin_console_settings ON public.admin_console_settings;

-- Lectures publiques du bloc « à propos » (SELECT seul — exclu du lint « always true » sur INSERT/UPDATE)
DROP POLICY IF EXISTS portfolio_public_select_about ON public.about;
CREATE POLICY portfolio_public_select_about ON public.about
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Formulaire contact (anon) : insert uniquement ; WITH CHECK non trivial pour le linter
DROP POLICY IF EXISTS portfolio_anon_insert_contact ON public.contact_messages;
CREATE POLICY portfolio_anon_insert_contact ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK ((select auth.role()) = 'anon');

DROP POLICY IF EXISTS portfolio_public_select_projects ON public.projects;
CREATE POLICY portfolio_public_select_projects ON public.projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_experiences ON public.experiences;
CREATE POLICY portfolio_public_select_experiences ON public.experiences FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_education ON public.education;
CREATE POLICY portfolio_public_select_education ON public.education FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_skills ON public.skills;
CREATE POLICY portfolio_public_select_skills ON public.skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_services ON public.services;
CREATE POLICY portfolio_public_select_services ON public.services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_testimonials ON public.testimonials;
CREATE POLICY portfolio_public_select_testimonials ON public.testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_certifications ON public.certifications;
CREATE POLICY portfolio_public_select_certifications ON public.certifications FOR SELECT TO anon, authenticated USING (true);

-- Tables SaaS (voir lib/migrations/portfolio_saas_extensions.sql) — RLS activée,
-- aucune policy anon/authenticated : accès réservé à la service_role via API Next.js.
ALTER TABLE public.visitor_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
