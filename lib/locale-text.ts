import type { AdminLocale } from '@/lib/admin-locale';

/** Contenu éditorial bilingue stocké en JSONB `{ "fr": "...", "en": "..." }`. */
export type LocaleText = { fr: string; en: string };

export function emptyLocaleText(): LocaleText {
  return { fr: '', en: '' };
}

export function fromDbJson(val: unknown, legacy?: string | null): LocaleText {
  if (val != null && typeof val === 'object' && !Array.isArray(val)) {
    const o = val as Record<string, unknown>;
    const fr = typeof o.fr === 'string' ? o.fr : '';
    const en = typeof o.en === 'string' ? o.en : '';
    if (fr !== '' || en !== '') return { fr, en };
  }
  const leg = (legacy ?? '').trim();
  return { fr: leg, en: '' };
}

export function toDbJson(t: LocaleText): { fr: string; en: string } {
  return { fr: t.fr ?? '', en: t.en ?? '' };
}

export function pickLocalized(t: LocaleText, locale: AdminLocale): string {
  const primary = locale === 'en' ? t.en : t.fr;
  const fallback = locale === 'en' ? t.fr : t.en;
  const p = (primary ?? '').trim();
  if (p) return primary ?? '';
  return (fallback ?? '').trim();
}

/** Tableaux de puces / lignes bilingues en JSONB. */
export function localeTextArrayFromDb(
  val: unknown,
  legacy: string[] | null | undefined
): LocaleText[] {
  if (Array.isArray(val) && val.length > 0) {
    const first = val[0];
    if (first != null && typeof first === 'object' && !Array.isArray(first)) {
      if ('fr' in first || 'en' in first) {
        return (val as unknown[]).map((item) => fromDbJson(item, null));
      }
    }
  }
  return (legacy ?? []).map((s) => ({ fr: s, en: '' }));
}

export function localeTextArrayToDb(arr: LocaleText[]): unknown {
  return arr.map((x) => toDbJson(x));
}

/** Pour colonnes legacy : garde le français (ou la langue préférée) à jour. */
export function primaryForLegacyColumn(t: LocaleText, primary: AdminLocale = 'fr'): string {
  return pickLocalized(t, primary);
}
