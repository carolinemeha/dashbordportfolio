-- Script de création des tables pour le portfolio de Caroline Meha

-- 1. Table ABOUT
CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  experience TEXT,
  nationality TEXT,
  shop_url TEXT,
  freelance_status TEXT,
  languages TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  youtube TEXT,
  website TEXT,
  roles TEXT[],
  timezone TEXT,
  available_status TEXT,
  cv_url TEXT,
  hero_badge TEXT,
  home_available_title TEXT,
  home_available_subtitle TEXT,
  home_stat_years INTEGER DEFAULT 8,
  home_stat_projects INTEGER DEFAULT 15,
  home_stat_clients INTEGER DEFAULT 12,
  home_stat_satisfaction INTEGER DEFAULT 100,
  whatsapp_url TEXT,
  telegram_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  demo_url TEXT,
  github_url TEXT,
  technologies TEXT[], -- Array of strings
  category TEXT,
  status TEXT, -- 'completed', 'in-progress', 'planned' (filtres page Work)
  date TEXT, -- YYYY-MM
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table EXPERIENCES
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  duration TEXT,
  achievements TEXT[],
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table EDUCATION
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  duration TEXT,
  courses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  category TEXT, -- 'Frontend', 'Backend', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table SERVICES
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  pricing JSONB, -- store {basic, standard, premium}
  category TEXT,
  icon_name TEXT,
  technologies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT,
  avatar TEXT,
  date TEXT,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'vitrine')),
  submitter_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table CERTIFICATIONS
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  issuer TEXT,
  date TEXT,
  credential TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table CONTACT_MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  budget TEXT,
  locale TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activer l'extension uuid-ossp si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 10. Table PAGE_VIEWS
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_hash TEXT,
  page_path TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Table CV_DOWNLOADS
CREATE TABLE IF NOT EXISTS cv_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Colonnes vitrine (accueil) & messagerie (alignement formulaire contact)
ALTER TABLE about ADD COLUMN IF NOT EXISTS hero_badge TEXT;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_available_title TEXT;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_available_subtitle TEXT;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_stat_years INTEGER DEFAULT 8;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_stat_projects INTEGER DEFAULT 15;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_stat_clients INTEGER DEFAULT 12;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_stat_satisfaction INTEGER DEFAULT 100;
ALTER TABLE about ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;
ALTER TABLE about ADD COLUMN IF NOT EXISTS telegram_url TEXT;

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS service TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS locale TEXT;

-- Ajouter updated_at aux tables existantes si absent
ALTER TABLE skills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- 12. Table CV_INFO
CREATE TABLE IF NOT EXISTS cv_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  upload_date TEXT,
  file_size TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Paramètres de la console admin (singleton : une ligne fixe)
CREATE TABLE IF NOT EXISTS admin_console_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_site_url TEXT DEFAULT '',
  sidebar_line1 TEXT DEFAULT 'Console',
  sidebar_line2 TEXT DEFAULT 'Portfolio',
  sidebar_logo_url TEXT DEFAULT '',
  landing_path TEXT DEFAULT '/admin/dashboard',
  sidebar_compact BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  preferences_extra JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_console_settings ADD COLUMN IF NOT EXISTS sidebar_logo_url TEXT DEFAULT '';
ALTER TABLE admin_console_settings ADD COLUMN IF NOT EXISTS preferences_extra JSONB DEFAULT '{}'::jsonb;

-- i18n contenu éditorial (FR/EN) — JSONB `{ "fr": "...", "en": "..." }` ; colonnes TEXT conservées = copie FR pour compat.
ALTER TABLE about ADD COLUMN IF NOT EXISTS name_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS title_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS bio_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS location_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS experience_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS nationality_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS freelance_status_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS languages_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS available_status_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS timezone_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS hero_badge_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_available_title_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS home_available_subtitle_i18n JSONB;
ALTER TABLE about ADD COLUMN IF NOT EXISTS roles_i18n JSONB;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_i18n JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_i18n JSONB;

ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_i18n JSONB;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS position_i18n JSONB;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS duration_i18n JSONB;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS location_i18n JSONB;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS achievements_i18n JSONB;

ALTER TABLE education ADD COLUMN IF NOT EXISTS institution_i18n JSONB;
ALTER TABLE education ADD COLUMN IF NOT EXISTS degree_i18n JSONB;
ALTER TABLE education ADD COLUMN IF NOT EXISTS duration_i18n JSONB;
ALTER TABLE education ADD COLUMN IF NOT EXISTS courses_i18n JSONB;

ALTER TABLE skills ADD COLUMN IF NOT EXISTS name_i18n JSONB;

ALTER TABLE services ADD COLUMN IF NOT EXISTS title_i18n JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_i18n JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS features_i18n JSONB;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS name_i18n JSONB;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS role_i18n JSONB;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS content_i18n JSONB;

ALTER TABLE certifications ADD COLUMN IF NOT EXISTS title_i18n JSONB;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issuer_i18n JSONB;

-- Données existantes : copier les colonnes TEXT / TEXT[] vers *_i18n (FR + EN vide).
-- Exécuter une fois sur une base déjà peuplée : lib/migrations/backfill_i18n_from_legacy.sql

-- RLS : activer sur toutes les tables. Anon = SELECT about + INSERT contact_messages seulement ;
-- l’admin passe par la clé service (voir /api/admin/db). Détail : lib/migrations/enable_rls.sql

ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_console_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS portfolio_anon_auth_all_about ON about;
DROP POLICY IF EXISTS portfolio_anon_auth_all_projects ON projects;
DROP POLICY IF EXISTS portfolio_anon_auth_all_experiences ON experiences;
DROP POLICY IF EXISTS portfolio_anon_auth_all_education ON education;
DROP POLICY IF EXISTS portfolio_anon_auth_all_skills ON skills;
DROP POLICY IF EXISTS portfolio_anon_auth_all_services ON services;
DROP POLICY IF EXISTS portfolio_anon_auth_all_testimonials ON testimonials;
DROP POLICY IF EXISTS portfolio_anon_auth_all_certifications ON certifications;
DROP POLICY IF EXISTS portfolio_anon_auth_all_contact_messages ON contact_messages;
DROP POLICY IF EXISTS portfolio_anon_auth_all_page_views ON page_views;
DROP POLICY IF EXISTS portfolio_anon_auth_all_cv_downloads ON cv_downloads;
DROP POLICY IF EXISTS portfolio_anon_auth_all_cv_info ON cv_info;
DROP POLICY IF EXISTS portfolio_anon_auth_all_admin_console_settings ON admin_console_settings;

DROP POLICY IF EXISTS portfolio_public_select_about ON about;
CREATE POLICY portfolio_public_select_about ON about FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_anon_insert_contact ON contact_messages;
CREATE POLICY portfolio_anon_insert_contact ON contact_messages FOR INSERT TO anon WITH CHECK ((select auth.role()) = 'anon');

-- Lectures publiques vitrine (clé anon) — alignées sur Myporfolio/lib/public*.ts
DROP POLICY IF EXISTS portfolio_public_select_projects ON projects;
CREATE POLICY portfolio_public_select_projects ON projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_experiences ON experiences;
CREATE POLICY portfolio_public_select_experiences ON experiences FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_education ON education;
CREATE POLICY portfolio_public_select_education ON education FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_skills ON skills;
CREATE POLICY portfolio_public_select_skills ON skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_services ON services;
CREATE POLICY portfolio_public_select_services ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_testimonials ON testimonials;
CREATE POLICY portfolio_public_select_testimonials ON testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS portfolio_public_select_certifications ON certifications;
CREATE POLICY portfolio_public_select_certifications ON certifications FOR SELECT TO anon, authenticated USING (true);

