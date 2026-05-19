import type { AdminLocale } from './admin-locale';

/** Cookie non-httpOnly pour que les route handlers lisent la langue UI admin (cohérence des messages API). */
export const ADMIN_LOCALE_COOKIE = 'admin_locale';

/**
 * À appeler uniquement depuis le client (après hydration).
 * Sans `Secure` en dev HTTP local.
 */
export function setAdminLocaleCookieOnClient(locale: AdminLocale): void {
  if (typeof document === 'undefined') return;
  const maxAgeSecs = 60 * 60 * 24 * 400;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${ADMIN_LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${maxAgeSecs}; SameSite=Lax${secure}`;
}
