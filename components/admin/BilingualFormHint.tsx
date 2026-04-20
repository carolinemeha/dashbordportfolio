'use client';

import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

/** Court rappel sous la description des modales à champs FR/EN (persistance JSONB dans Supabase). */
export function BilingualFormHint({ className }: { className?: string }) {
  const { t } = useAdminI18n();
  return (
    <p
      className={
        className ??
        'text-xs text-muted-foreground border-l-2 border-primary/35 pl-2.5 mt-2 leading-relaxed'
      }
    >
      {t('forms.shared.bilingualHint')}
    </p>
  );
}
