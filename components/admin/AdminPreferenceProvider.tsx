'use client';

import * as React from 'react';
import {
  ADMIN_PREFERENCES_EVENT,
  applyAdminReduceMotionToDocument,
  getAdminPreferences,
  getDefaultPreferences,
  hydratePreferencesFromCloud,
  type AdminPreferencesV1,
} from '@/lib/admin-preferences';

type AdminPreferenceContextValue = {
  prefs: AdminPreferencesV1;
  refresh: () => void;
};

const AdminPreferenceContext = React.createContext<AdminPreferenceContextValue | null>(
  null
);

export function AdminPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = React.useState<AdminPreferencesV1>(getDefaultPreferences);

  const refresh = React.useCallback(() => {
    const next = getAdminPreferences();
    setPrefs(next);
    applyAdminReduceMotionToDocument(next.reduceMotion);
  }, []);

  React.useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin-preferences-v1' || e.key === null) refresh();
    };
    window.addEventListener(ADMIN_PREFERENCES_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ADMIN_PREFERENCES_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  React.useEffect(() => {
    let cancelled = false;
    void hydratePreferencesFromCloud().then((ok) => {
      if (ok && !cancelled) refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = React.useMemo(
    () => ({ prefs, refresh }),
    [prefs, refresh]
  );

  return (
    <AdminPreferenceContext.Provider value={value}>
      {children}
    </AdminPreferenceContext.Provider>
  );
}

export function useAdminPreferences(): AdminPreferenceContextValue {
  const ctx = React.useContext(AdminPreferenceContext);
  if (!ctx) {
    throw new Error('useAdminPreferences doit être utilisé dans AdminPreferenceProvider');
  }
  return ctx;
}
