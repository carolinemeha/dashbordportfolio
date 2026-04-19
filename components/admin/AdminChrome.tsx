'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { prefs } = useAdminPreferences();
  const { t } = useAdminI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const compact = prefs.sidebarCompact;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-full min-h-0 admin-surface text-foreground flex overflow-hidden">
      <Sidebar
        variant="desktop"
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 z-20',
          compact ? 'md:w-[4.5rem]' : 'md:w-[17rem]'
        )}
      />

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className={cn(
            'p-0 w-[min(18rem,92vw)] border-r border-sidebar-border',
            'bg-sidebar'
          )}
        >
          <SheetTitle className="sr-only">{t('sidebar.mobileMenuTitle')}</SheetTitle>
          <Sidebar
            variant="mobile"
            onItemClick={closeMobileMenu}
            className="flex flex-col h-full"
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col w-full min-w-0',
          compact ? 'md:pl-[4.5rem]' : 'md:pl-[17rem]'
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main
            className={cn(
              'p-4 sm:p-6 lg:p-8',
              prefs.density === 'compact' && 'p-3 sm:p-4 lg:p-5'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-7xl mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
