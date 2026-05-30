-- Produit mis en avant (badge POPULAIRE) — même migration que Myporfolio/supabase/migrations/014_marketplace_featured.sql
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.marketplace_products
SET is_featured = TRUE
WHERE slug = 'glass-ui-kit-premium';
