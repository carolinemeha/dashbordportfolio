-- =============================================
-- Supabase Storage : Bucket "portfolio" + Policies
-- À exécuter dans l'éditeur SQL de Supabase
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

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access to portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to portfolio" ON storage.objects;

-- 3. Lecture publique (tout le monde peut voir les fichiers)
CREATE POLICY "portfolio_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- 4. Upload libre pour le bucket portfolio
--    (l'accès est sécurisé côté API par le cookie JWT admin)
CREATE POLICY "portfolio_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio');

-- 5. Mise à jour des fichiers existants
CREATE POLICY "portfolio_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio');

-- 6. Suppression des fichiers
CREATE POLICY "portfolio_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio');

-- 7. Vérification
SELECT id, name, public FROM storage.buckets WHERE id = 'portfolio';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
