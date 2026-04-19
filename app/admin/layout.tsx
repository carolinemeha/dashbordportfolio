'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminChrome from '@/components/admin/AdminChrome';
import { AdminPreferenceProvider } from '@/components/admin/AdminPreferenceProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <AdminPreferenceProvider>
        <AdminChrome>{children}</AdminChrome>
      </AdminPreferenceProvider>
    </AuthGuard>
  );
}
