'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { buildAdminNavigation } from '@/lib/admin-nav';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { cn } from '@/lib/utils';
import {
  ADMIN_PREFERENCES_EVENT,
  getAdminBrandPrefs,
  type AdminBrandPrefs,
} from '@/lib/admin-preferences';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const navItem = {
  hidden: { opacity: 1, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
};

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
  /** Évite les conflits de layoutId Framer entre barre desktop et feuille mobile */
  variant?: 'desktop' | 'mobile';
}

export default function Sidebar({
  onItemClick,
  className,
  variant = 'desktop',
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const layoutId = `admin-nav-active-${variant}`;
  const { prefs } = useAdminPreferences();
  const { t } = useAdminI18n();
  const navItems = React.useMemo(() => buildAdminNavigation(t), [t]);
  const compact = prefs.sidebarCompact && variant === 'desktop';

  const [brand, setBrand] = useState<AdminBrandPrefs>({
    line1: 'Console',
    line2: 'Portfolio',
    logoUrl: '',
  });
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setBrand(getAdminBrandPrefs());
    const sync = () => setBrand(getAdminBrandPrefs());
    window.addEventListener(ADMIN_PREFERENCES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ADMIN_PREFERENCES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setLogoFailed(false);
  }, [brand.logoUrl]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
    router.refresh();
  };

  const inner = (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div
        className={cn(
          'flex h-full min-h-0 flex-col',
          'bg-sidebar text-sidebar-foreground',
          'border-r border-sidebar-border',
          'shadow-[inset_-1px_0_0_hsl(var(--sidebar-border)/0.5)]'
        )}
      >
        {/* En-tête marque — fixe, ne défile pas */}
        <div
          className={cn(
            'shrink-0 border-b border-sidebar-border/70 bg-sidebar/95',
            compact ? 'px-2 pt-4 pb-3' : 'px-5 pt-5 pb-4'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 min-w-0',
              compact && 'justify-center'
            )}
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
              {brand.logoUrl && !logoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt=""
                  className="h-full w-full object-contain p-1"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <Sparkles
                  className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5 text-primary"
                  aria-hidden
                />
              )}
            </div>
            <div className={cn('min-w-0 flex-1', compact && 'sr-only')}>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground truncate">
                {brand.line1}
              </p>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-gradient leading-snug truncate">
                {brand.line2}
              </h1>
            </div>
          </div>
        </div>

        <p
          className={cn(
            'shrink-0 px-5 pt-3 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90',
            compact && 'sr-only'
          )}
        >
          {t('sidebar.contentSection')}
        </p>

        {/* Liens — zone seule qui défile */}
        <nav
          className={cn(
            'flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-2',
            'sidebar-nav-scroll',
            compact ? 'px-1.5' : 'px-3'
          )}
          aria-label="Navigation principale"
        >
          <motion.div
            className="space-y-0.5 pb-2"
            variants={navContainer}
            initial={false}
            animate="show"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const link = (
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                    'transition-colors duration-200',
                    compact && 'justify-center px-2 gap-0',
                    isActive
                      ? 'text-primary'
                      : 'text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent/80'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId={layoutId}
                      className="absolute inset-0 rounded-xl bg-primary/12 ring-1 ring-primary/15"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 33,
                      }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'relative z-10 h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-colors duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'relative z-10 truncate',
                      compact && 'sr-only'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );

              return (
                <motion.div key={item.href} variants={navItem}>
                  {compact ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </nav>

        <div className="shrink-0 border-t border-sidebar-border/80 p-3 bg-sidebar/90 backdrop-blur-sm">
          {compact ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className={cn(
                    'w-full justify-center gap-0 h-11 rounded-xl px-0',
                    'text-muted-foreground hover:text-destructive',
                    'hover:bg-destructive/10 transition-colors duration-200'
                  )}
                  aria-label={t('sidebar.logout')}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t('sidebar.logout')}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-11 rounded-xl',
                'text-muted-foreground hover:text-destructive',
                'hover:bg-destructive/10 transition-colors duration-200'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {t('sidebar.logout')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <TooltipProvider delayDuration={300}>{inner}</TooltipProvider>
    );
  }

  return inner;
}
