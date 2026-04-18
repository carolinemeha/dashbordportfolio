'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20" />

        {/* Mobile Menu (Sheet) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r-border/50 bg-background">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <div className="h-full">
              <Sidebar onItemClick={closeMobileMenu} className="flex flex-col h-full" />
            </div>
          </SheetContent>
        </Sheet>

        <div className="md:pl-64 flex flex-col flex-1 w-full min-w-0">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="max-w-7xl mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}