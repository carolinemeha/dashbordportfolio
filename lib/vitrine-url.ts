/** URL de base du site vitrine (Myporfolio). */
export function getVitrineBaseUrl() {
  return (process.env.NEXT_PUBLIC_VITRINE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

/** Résout un chemin vitrine ou une URL absolue pour aperçu admin. */
export function resolveVitrineAssetUrl(path: string) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${getVitrineBaseUrl()}${normalized}`;
}
