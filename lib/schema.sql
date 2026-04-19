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

-- Désactivation RLS pour l'administration simplifiée
ALTER TABLE about DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE education DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE cv_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE cv_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_console_settings DISABLE ROW LEVEL SECURITY;

