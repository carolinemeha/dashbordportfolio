'use client';

import * as React from 'react';
import {
  ADMIN_PREFERENCES_EVENT,
  getAdminPreferences,
  patchAdminPreferences,
} from '@/lib/admin-preferences';
import { isAdminLocale, type AdminLocale } from '@/lib/admin-locale';
import fr from '@/messages/admin-fr.json';
import frMore from '@/messages/admin-more-fr.json';
import en from '@/messages/admin-en.json';
import enMore from '@/messages/admin-more-en.json';

type AdminMessages = typeof fr & typeof frMore;

const MESSAGES: Record<AdminLocale, AdminMessages> = {
  fr: { ...fr, ...frMore } as AdminMessages,
  en: { ...en, ...enMore } as AdminMessages,
};

function readLocaleFromStorage(): AdminLocale {
  if (typeof window === 'undefined') return 'fr';
  const l = getAdminPreferences().locale;
  return isAdminLocale(l) ? l : 'fr';
}

function getDeep(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc != null && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(
  str: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`
  );
}

export type AdminI18nContextValue = {
  locale: AdminLocale;
  /** Pour `toLocaleDateString`, `date-fns`, etc. */
  dateLocale: string;
  setLocale: (l: AdminLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const AdminI18nContext = React.createContext<AdminI18nContextValue | null>(
  null
);

function DocumentLang({ locale }: { locale: AdminLocale }) {
  React.useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'fr';
  }, [locale]);
  return null;
}

export function AdminI18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /** Même valeur SSR et 1er rendu client : évite l’erreur d’hydratation si localStorage ≠ défaut. */
  const [locale, setLocaleState] = React.useState<AdminLocale>('fr');

  React.useLayoutEffect(() => {
    setLocaleState(readLocaleFromStorage());
  }, []);

  React.useEffect(() => {
    const sync = () => {
      const l = readLocaleFromStorage();
      setLocaleState(l);
    };
    window.addEventListener(ADMIN_PREFERENCES_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin-preferences-v1' || e.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ADMIN_PREFERENCES_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setLocale = React.useCallback((l: AdminLocale) => {
    setLocaleState(l);
    patchAdminPreferences({ locale: l });
  }, []);

  const messages = MESSAGES[locale];

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const v = getDeep(messages, key);
      if (typeof v === 'string') return interpolate(v, vars);
      if (v != null && typeof v !== 'object') return String(v);
      return key;
    },
    [messages]
  );

  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';

  const value = React.useMemo(
    () => ({ locale, dateLocale, setLocale, t }),
    [locale, dateLocale, setLocale, t]
  );

  return (
    <AdminI18nContext.Provider value={value}>
      <DocumentLang locale={locale} />
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n(): AdminI18nContextValue {
  const ctx = React.useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error('useAdminI18n doit être utilisé dans AdminI18nProvider');
  }
  return ctx;
}
