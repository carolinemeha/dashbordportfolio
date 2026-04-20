'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle, LogOut, PanelLeft, Copy, Megaphone } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { getAdminPageMeta } from '@/lib/admin-nav';
import { cn } from '@/lib/utils';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
}

type MeResponse = {
  name: string;
  email: string;
  sessionEmail?: string;
  publicEmail?: string | null;
  title?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  phone?: string | null;
  role?: string;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname() ?? '';
  const { prefs } = useAdminPreferences();
  const { t } = useAdminI18n();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const meta = getAdminPageMeta(pathname, t);
  const pageHeading = meta?.heading ?? t('common.administration');
  const pageDescription =
    meta?.description ?? t('common.adminPanelHint');
  const PageIcon = meta?.icon ?? PanelLeft;

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/admin/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={cn(
        'sticky top-0 z-40 w-full shrink-0',
        'border-b border-border/60 bg-background/95 shadow-sm',
        'supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-background/80'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[3.75rem] sm:min-h-[4.25rem] py-2 sm:py-2.5 items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              aria-label={t('header.openMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div
              key={pathname}
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
            >
              <PageIcon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <motion.h1
                key={pageHeading}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] sm:text-lg md:text-xl font-semibold tracking-tight text-foreground line-clamp-2 sm:line-clamp-1"
              >
                {pageHeading}
              </motion.h1>
              {!prefs.headerMinimal ? (
                <motion.p
                  key={pageDescription}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.03 }}
                  className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-snug max-w-[min(100%,42rem)]"
                >
                  {pageDescription}
                </motion.p>
              ) : null}
              {prefs.showRouteCrumb ? (
                <div className="mt-1 flex items-center gap-1.5 min-w-0">
                  <code className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate font-mono bg-muted/40 px-1.5 py-0.5 rounded-md max-w-[min(100%,36rem)]">
                    {pathname}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(pathname).then(() => {
                        toast.success(t('common.pathCopied'));
                      });
                    }}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    title={t('header.copyPathTitle')}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />

            {user && (
              <div
                className={cn(
                  'flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4',
                  'border-l border-border/60'
                )}
              >
                <div className="hidden sm:flex flex-col items-end leading-tight min-w-0 max-w-[220px]">
                  <span className="text-sm font-medium text-foreground truncate w-full text-end">
                    {user.name}
                  </span>
                  {user.title ? (
                    <span className="text-[11px] text-muted-foreground truncate w-full text-end">
                      {user.title}
                    </span>
                  ) : null}
                  <span
                    className="text-[11px] text-muted-foreground truncate w-full text-end"
                    title={
                      user.publicEmail &&
                      user.sessionEmail &&
                      user.publicEmail !== user.sessionEmail
                        ? `Connexion : ${user.sessionEmail}`
                        : undefined
                    }
                  >
                    {user.publicEmail || user.sessionEmail || user.email}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/12 flex items-center justify-center ring-1 ring-primary/20 overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-5 w-5 text-primary" aria-hidden />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title={t('header.logout')}
                >
                  {isLoggingOut ? (
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        {prefs.headerBanner.trim() ? (
          <div className="border-t border-border/40 bg-primary/[0.06] py-2.5">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
              <Megaphone className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
              <p className="leading-snug">{prefs.headerBanner.trim()}</p>
            </div>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
