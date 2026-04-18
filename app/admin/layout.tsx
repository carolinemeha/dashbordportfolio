'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { AnimatePresence, motion } from 'framer-motion';

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
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
        <Sidebar />
        <div className="md:pl-64 flex flex-col flex-1 w-full min-w-0">
          <Header />
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