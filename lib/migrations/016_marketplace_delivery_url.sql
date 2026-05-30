-- Lien de livraison (ZIP, Drive, repo privé) — admin uniquement, jamais exposé sur l'API publique.
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS delivery_url TEXT;

COMMENT ON COLUMN public.marketplace_products.delivery_url IS
  'URL de téléchargement ou accès au kit après paiement ; réservé admin (non publié vitrine).';
