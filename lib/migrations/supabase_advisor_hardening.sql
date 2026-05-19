-- Correctifs alignés sur le linter Supabase (Advisors) — à exécuter dans l’éditeur SQL.
-- 1) Storage : bucket public sans politique SELECT large sur storage.objects (les URLs /object/public/... fonctionnent quand même).
-- 2) Storage : pas d’INSERT/UPDATE/DELETE anonymes — uploads via /api/upload (service_role).
-- 3) Fonction SECURITY DEFINER exposée : retirer EXECUTE à anon / authenticated / PUBLIC.

-- ——— Storage : portfolio ———
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

-- ——— Fonction public.rls_auto_enable (si présente) ———
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'rls_auto_enable'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', r.fn);
  END LOOP;
END $$;
