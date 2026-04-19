'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { t } = useAdminI18n();

  useEffect(() => {
    // Le vrai guard est le middleware serveur.
    // Ici on vérifie juste côté client pour afficher un loader propre.
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [router]);

  if (isChecking) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{t('auth.checking')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}