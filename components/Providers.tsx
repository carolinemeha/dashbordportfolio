'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { AdminI18nProvider } from '@/components/admin/AdminI18nProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="h-full min-h-0">
          {children}
          <Toaster richColors position="top-center" />
        </div>
      </ThemeProvider>
    </AdminI18nProvider>
  );
}
