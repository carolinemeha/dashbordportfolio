export const ADMIN_LOCALES = ['fr', 'en'] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export function isAdminLocale(v: unknown): v is AdminLocale {
  return v === 'fr' || v === 'en';
}
