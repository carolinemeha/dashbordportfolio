/** Préférences locales de la console (navigateur uniquement). */

import { ADMIN_DEFAULT_LANDING, getAllowedLandingHrefs } from '@/lib/admin-nav';
import { isAdminLocale, type AdminLocale } from '@/lib/admin-locale';

export const ADMIN_PREFERENCES_EVENT = 'admin-preferences-updated';

const PREFS_KEY = 'admin-preferences-v1';
const LEGACY_BRAND_KEY = 'admin-console-brand';

export type AdminBrandPrefs = {
  line1: string;
  line2: string;
  /** URL absolue (Supabase), data: ou chemin / — affiché en haut de la sidebar */
  logoUrl: string;
};

export type AdminPreferencesV1 = {
  v: 1;
  brand: AdminBrandPrefs;
  /** Sidebar étroite : icônes seules sur bureau */
  sidebarCompact: boolean;
  /** Réduit les animations de l’interface admin */
  reduceMotion: boolean;
  /** Redirection après connexion */
  landingPath: string;
  /** URL du portfolio public (raccourci, optionnel) */
  publicSiteUrl: string;
  /** Marge / padding du contenu principal */
  density: 'comfortable' | 'compact';
  /** Message optionnel sous l’en-tête de page (toutes les pages admin) */
  headerBanner: string;
  /** Afficher le chemin de route sous la description de page */
  showRouteCrumb: boolean;
  /** Masquer la description longue sous le titre (en-tête plus sobre) */
  headerMinimal: boolean;
  /** Dates dans « Activité récente » du tableau de bord */
  dashboardDateStyle: 'relative' | 'absolute';
  /** Recharger les stats du tableau de bord automatiquement (~45 s) */
  dashboardAutoRefresh: boolean;
  /** Langue de l’interface (alignée sur le site : fr | en) */
  locale: AdminLocale;
};

const brandDefaults: AdminBrandPrefs = {
  line1: 'Console',
  line2: 'Portfolio',
  logoUrl: '',
};

function normalizeLogoUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const t = raw.trim().slice(0, 2048);
  if (!t) return '';
  const lower = t.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) return t;
  if (lower.startsWith('data:image/')) return t;
  if (t.startsWith('/')) return t;
  return '';
}

function normalizeLanding(path: string): string {
  const t = (path || '').trim();
  if (getAllowedLandingHrefs().includes(t)) return t;
  return ADMIN_DEFAULT_LANDING;
}

function normalizePublicUrl(raw: string): string {
  return raw.trim().slice(0, 512);
}

function applyReduceMotionClass(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('admin-reduce-motion', on);
}

/** Synchronise la classe `admin-reduce-motion` sur la racine du document (client uniquement). */
export function applyAdminReduceMotionToDocument(reduceMotion: boolean): void {
  applyReduceMotionClass(reduceMotion);
}

export function getDefaultPreferences(): AdminPreferencesV1 {
  return {
    v: 1,
    brand: { ...brandDefaults },
    sidebarCompact: false,
    reduceMotion: false,
    landingPath: ADMIN_DEFAULT_LANDING,
    publicSiteUrl: '',
    density: 'comfortable',
    headerBanner: '',
    showRouteCrumb: false,
    headerMinimal: false,
    dashboardDateStyle: 'relative',
    dashboardAutoRefresh: false,
    locale: 'fr',
  };
}

function normalizePrefs(p: Partial<AdminPreferencesV1>): AdminPreferencesV1 {
  const def = getDefaultPreferences();
  const brandIn = p.brand ?? def.brand;
  return {
    v: 1,
    brand: {
      line1:
        typeof brandIn.line1 === 'string' && brandIn.line1.trim()
          ? brandIn.line1.trim().slice(0, 28)
          : brandDefaults.line1,
      line2:
        typeof brandIn.line2 === 'string' && brandIn.line2.trim()
          ? brandIn.line2.trim().slice(0, 36)
          : brandDefaults.line2,
      logoUrl: normalizeLogoUrl(brandIn.logoUrl),
    },
    sidebarCompact: Boolean(p.sidebarCompact),
    reduceMotion: Boolean(p.reduceMotion),
    landingPath: normalizeLanding(
      typeof p.landingPath === 'string' ? p.landingPath : def.landingPath
    ),
    publicSiteUrl:
      typeof p.publicSiteUrl === 'string'
        ? normalizePublicUrl(p.publicSiteUrl)
        : '',
    density: p.density === 'compact' ? 'compact' : 'comfortable',
    headerBanner:
      typeof p.headerBanner === 'string'
        ? p.headerBanner.trim().slice(0, 200)
        : '',
    showRouteCrumb: Boolean(p.showRouteCrumb),
    headerMinimal: Boolean(p.headerMinimal),
    dashboardDateStyle:
      p.dashboardDateStyle === 'absolute' ? 'absolute' : 'relative',
    dashboardAutoRefresh: Boolean(p.dashboardAutoRefresh),
    locale: isAdminLocale(p.locale) ? p.locale : def.locale,
  };
}

/** Normalise un objet partiel (ex. lecture Supabase). */
export function normalizeAdminPreferences(
  p: Partial<AdminPreferencesV1>
): AdminPreferencesV1 {
  const def = getDefaultPreferences();
  return normalizePrefs({
    ...def,
    ...p,
    brand:
      p.brand !== undefined ? { ...def.brand, ...p.brand } : def.brand,
  });
}

function migrateLegacyBrand(): AdminBrandPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LEGACY_BRAND_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<AdminBrandPrefs>;
    localStorage.removeItem(LEGACY_BRAND_KEY);
    return {
      line1:
        typeof p.line1 === 'string' && p.line1.trim()
          ? p.line1.trim().slice(0, 28)
          : brandDefaults.line1,
      line2:
        typeof p.line2 === 'string' && p.line2.trim()
          ? p.line2.trim().slice(0, 36)
          : brandDefaults.line2,
      logoUrl: normalizeLogoUrl(p.logoUrl),
    };
  } catch {
    localStorage.removeItem(LEGACY_BRAND_KEY);
    return null;
  }
}

export function getAdminPreferences(): AdminPreferencesV1 {
  if (typeof window === 'undefined') return getDefaultPreferences();
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminPreferencesV1>;
      if (parsed && parsed.v === 1) {
        return normalizePrefs(parsed);
      }
    }
    const legacyBrand = migrateLegacyBrand();
    const base = getDefaultPreferences();
    if (legacyBrand) {
      const merged = normalizePrefs({ ...base, brand: legacyBrand });
      localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event(ADMIN_PREFERENCES_EVENT));
      return merged;
    }
  } catch {
    /* ignore */
  }
  return getDefaultPreferences();
}

let cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleConsoleSettingsSync(prefs: AdminPreferencesV1): void {
  if (typeof window === 'undefined') return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    cloudSyncTimer = null;
    void import('@/lib/data').then(({ dataService }) => {
      void dataService.upsertConsoleSettings(prefs);
    });
  }, 450);
}

export function setAdminPreferences(
  next: AdminPreferencesV1,
  opts?: { skipCloud?: boolean }
): void {
  if (typeof window === 'undefined') return;
  const n = normalizePrefs(next);
  localStorage.setItem(PREFS_KEY, JSON.stringify(n));
  applyReduceMotionClass(n.reduceMotion);
  window.dispatchEvent(new Event(ADMIN_PREFERENCES_EVENT));
  if (!opts?.skipCloud) scheduleConsoleSettingsSync(n);
}

export function patchAdminPreferences(
  patch: Partial<Omit<AdminPreferencesV1, 'v'>> & { brand?: Partial<AdminBrandPrefs> },
  opts?: { skipCloud?: boolean }
): AdminPreferencesV1 {
  const cur = getAdminPreferences();
  const merged: AdminPreferencesV1 = normalizePrefs({
    ...cur,
    ...patch,
    brand: patch.brand ? { ...cur.brand, ...patch.brand } : cur.brand,
  });
  setAdminPreferences(merged, opts);
  return merged;
}

/** Première connexion ou page login : page d’accueil après authentification */
export function getPostLoginLandingPath(): string {
  if (typeof window === 'undefined') return ADMIN_DEFAULT_LANDING;
  return getAdminPreferences().landingPath;
}

export function getAdminBrandPrefs(): AdminBrandPrefs {
  return getAdminPreferences().brand;
}

export function setAdminBrandPrefs(next: AdminBrandPrefs): void {
  patchAdminPreferences({ brand: next }, undefined);
}

export function resetAdminBrandPrefs(): void {
  patchAdminPreferences({ brand: { ...brandDefaults } });
}

export function resetAllAdminPreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFS_KEY);
  localStorage.removeItem(LEGACY_BRAND_KEY);
  const def = getDefaultPreferences();
  localStorage.setItem(PREFS_KEY, JSON.stringify(def));
  applyReduceMotionClass(false);
  window.dispatchEvent(new Event(ADMIN_PREFERENCES_EVENT));
  scheduleConsoleSettingsSync(def);
}

/** Applique les préférences stockées dans Supabase (sans renvoyer immédiatement au cloud). */
export async function hydratePreferencesFromCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const { dataService } = await import('@/lib/data');
  const cloud = await dataService.getConsoleSettings();
  if (!cloud) return false;
  setAdminPreferences(normalizeAdminPreferences(cloud), { skipCloud: true });
  return true;
}

/** Envoie immédiatement l’état local vers la table `admin_console_settings`. */
export async function pushPreferencesToCloudNow(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const { dataService } = await import('@/lib/data');
  return dataService.upsertConsoleSettings(getAdminPreferences());
}

export function exportAdminPreferencesJson(): string {
  return JSON.stringify(getAdminPreferences(), null, 2);
}

export function importAdminPreferencesJson(raw: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as Partial<AdminPreferencesV1>;
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'JSON invalide.' };
    }
    const merged = normalizeAdminPreferences(
      parsed as Partial<AdminPreferencesV1>
    );
    setAdminPreferences(merged);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier.' };
  }
}
