-- =============================================================================
-- Migration : remplir les colonnes JSONB *_i18n depuis les colonnes TEXT / TEXT[]
-- =============================================================================
-- Prérequis : colonnes *_i18n créées (voir lib/schema.sql, section i18n).
--
-- Convention (alignée sur lib/locale-text.ts) :
--   - Objet scalaire : {"fr": "<valeur historique>", "en": ""}
--   - Tableau (rôles, accomplissements, cours, features) : [{"fr":"...","en":""}, ...]
--
-- Idempotent : ne met à jour une colonne *_i18n que si elle est NULL (ne pas
-- écraser un contenu bilingue déjà saisi dans l’admin).
--
-- À exécuter une fois dans l’éditeur SQL Supabase (ou psql) sur une base
-- existante migrée avant l’introduction du multilingue.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- about (une ligne typique)
-- -----------------------------------------------------------------------------
UPDATE about SET
  name_i18n = jsonb_build_object('fr', COALESCE(name, ''), 'en', '')
WHERE name_i18n IS NULL;

UPDATE about SET
  title_i18n = jsonb_build_object('fr', COALESCE(title, ''), 'en', '')
WHERE title_i18n IS NULL;

UPDATE about SET
  bio_i18n = jsonb_build_object('fr', COALESCE(bio, ''), 'en', '')
WHERE bio_i18n IS NULL;

UPDATE about SET
  location_i18n = jsonb_build_object('fr', COALESCE(location, ''), 'en', '')
WHERE location_i18n IS NULL;

UPDATE about SET
  experience_i18n = jsonb_build_object('fr', COALESCE(experience, ''), 'en', '')
WHERE experience_i18n IS NULL;

UPDATE about SET
  nationality_i18n = jsonb_build_object('fr', COALESCE(nationality, ''), 'en', '')
WHERE nationality_i18n IS NULL;

UPDATE about SET
  freelance_status_i18n = jsonb_build_object('fr', COALESCE(freelance_status, ''), 'en', '')
WHERE freelance_status_i18n IS NULL;

UPDATE about SET
  languages_i18n = jsonb_build_object('fr', COALESCE(languages, ''), 'en', '')
WHERE languages_i18n IS NULL;

UPDATE about SET
  available_status_i18n = jsonb_build_object('fr', COALESCE(available_status, ''), 'en', '')
WHERE available_status_i18n IS NULL;

UPDATE about SET
  timezone_i18n = jsonb_build_object('fr', COALESCE(timezone, ''), 'en', '')
WHERE timezone_i18n IS NULL;

UPDATE about SET
  hero_badge_i18n = jsonb_build_object('fr', COALESCE(hero_badge, ''), 'en', '')
WHERE hero_badge_i18n IS NULL;

UPDATE about SET
  home_available_title_i18n = jsonb_build_object('fr', COALESCE(home_available_title, ''), 'en', '')
WHERE home_available_title_i18n IS NULL;

UPDATE about SET
  home_available_subtitle_i18n = jsonb_build_object('fr', COALESCE(home_available_subtitle, ''), 'en', '')
WHERE home_available_subtitle_i18n IS NULL;

UPDATE about SET
  roles_i18n = COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('fr', r, 'en', ''))
      FROM unnest(COALESCE(roles, ARRAY[]::text[])) AS r
    ),
    '[]'::jsonb
  )
WHERE roles_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------
UPDATE projects SET
  title_i18n = jsonb_build_object('fr', COALESCE(title, ''), 'en', '')
WHERE title_i18n IS NULL;

UPDATE projects SET
  description_i18n = jsonb_build_object('fr', COALESCE(description, ''), 'en', '')
WHERE description_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- experiences
-- -----------------------------------------------------------------------------
UPDATE experiences SET
  company_i18n = jsonb_build_object('fr', COALESCE(company, ''), 'en', '')
WHERE company_i18n IS NULL;

UPDATE experiences SET
  position_i18n = jsonb_build_object('fr', COALESCE(position, ''), 'en', '')
WHERE position_i18n IS NULL;

UPDATE experiences SET
  duration_i18n = jsonb_build_object('fr', COALESCE(duration, ''), 'en', '')
WHERE duration_i18n IS NULL;

UPDATE experiences SET
  location_i18n = jsonb_build_object('fr', COALESCE(location, ''), 'en', '')
WHERE location_i18n IS NULL;

UPDATE experiences SET
  achievements_i18n = COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('fr', a, 'en', ''))
      FROM unnest(COALESCE(achievements, ARRAY[]::text[])) AS a
    ),
    '[]'::jsonb
  )
WHERE achievements_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- education
-- -----------------------------------------------------------------------------
UPDATE education SET
  institution_i18n = jsonb_build_object('fr', COALESCE(institution, ''), 'en', '')
WHERE institution_i18n IS NULL;

UPDATE education SET
  degree_i18n = jsonb_build_object('fr', COALESCE(degree, ''), 'en', '')
WHERE degree_i18n IS NULL;

UPDATE education SET
  duration_i18n = jsonb_build_object('fr', COALESCE(duration, ''), 'en', '')
WHERE duration_i18n IS NULL;

UPDATE education SET
  courses_i18n = COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('fr', c, 'en', ''))
      FROM unnest(COALESCE(courses, ARRAY[]::text[])) AS c
    ),
    '[]'::jsonb
  )
WHERE courses_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- skills
-- -----------------------------------------------------------------------------
UPDATE skills SET
  name_i18n = jsonb_build_object('fr', COALESCE(name, ''), 'en', '')
WHERE name_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
UPDATE services SET
  title_i18n = jsonb_build_object('fr', COALESCE(title, ''), 'en', '')
WHERE title_i18n IS NULL;

UPDATE services SET
  description_i18n = jsonb_build_object('fr', COALESCE(description, ''), 'en', '')
WHERE description_i18n IS NULL;

UPDATE services SET
  features_i18n = COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('fr', f, 'en', ''))
      FROM unnest(COALESCE(features, ARRAY[]::text[])) AS f
    ),
    '[]'::jsonb
  )
WHERE features_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- testimonials
-- -----------------------------------------------------------------------------
UPDATE testimonials SET
  name_i18n = jsonb_build_object('fr', COALESCE(name, ''), 'en', '')
WHERE name_i18n IS NULL;

UPDATE testimonials SET
  role_i18n = jsonb_build_object('fr', COALESCE(role, ''), 'en', '')
WHERE role_i18n IS NULL;

UPDATE testimonials SET
  content_i18n = jsonb_build_object('fr', COALESCE(content, ''), 'en', '')
WHERE content_i18n IS NULL;

-- -----------------------------------------------------------------------------
-- certifications
-- -----------------------------------------------------------------------------
UPDATE certifications SET
  title_i18n = jsonb_build_object('fr', COALESCE(title, ''), 'en', '')
WHERE title_i18n IS NULL;

UPDATE certifications SET
  issuer_i18n = jsonb_build_object('fr', COALESCE(issuer, ''), 'en', '')
WHERE issuer_i18n IS NULL;
