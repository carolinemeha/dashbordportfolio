-- =============================================
-- Supabase Storage : Bucket "portfolio"
-- À exécuter dans l'éditeur SQL de Supabase
--
-- Bucket public : les fichiers restent accessibles via URL
-- /storage/v1/object/public/portfolio/...
-- sans politique SELECT large sur storage.objects (recommandation linter Supabase
-- « Public Bucket Allows Listing » — voir lint 0025).
--
-- Écritures : uniquement via service_role (ex. route POST /api/upload).
-- Exécuter après coup : lib/migrations/supabase_advisor_hardening.sql
-- (supprime les anciennes politiques trop permissives sur une base déjà créée).
-- =============================================

-- 1. Créer le bucket s'il n'existe pas encore
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  10485760, -- 10 Mo max
  ARRAY[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 2. Retirer les politiques qui exposent le listing (SELECT) ou les écritures anonymes
DROP POLICY IF EXISTS "portfolio_public_select" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_insert" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to portfolio" ON storage.objects;

-- 3. Aucune politique RLS sur storage.objects pour ce bucket : le service_role
--    contourne RLS ; les URLs publiques restent servies pour bucket public.

-- 4. Vérification
SELECT id, name, public FROM storage.buckets WHERE id = 'portfolio';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
