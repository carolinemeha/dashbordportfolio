'use client';

import { motion, Variants } from 'framer-motion';
import { Settings, Shield, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

export default function Home() {
  const { t } = useAdminI18n();

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 1, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[bottom_1px_center]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[800px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px] opacity-50 dark:opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 relative z-10">
        <motion.div
          className="text-center space-y-10"
          initial={false}
          animate="show"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-primary bg-primary/10 ring-1 ring-inset ring-primary/20 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              {t('landing.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              {t('landing.titlePortfolio')}
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent ml-3 drop-shadow-sm">
                {t('landing.titleAdmin')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
              <Link href="/admin/dashboard">
                {t('landing.ctaDashboard')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-secondary transition-all">
              <Link href="/admin/login">
                {t('landing.ctaLogin')}
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                <Settings className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('landing.card1Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.card1Desc')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20">
                <Shield className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('landing.card2Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.card2Desc')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-indigo-500/20">
                <LayoutDashboard className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('landing.card3Title')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.card3Desc')}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 pt-16 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              {t('landing.footerBefore')}{' '}
              <Link href="/admin/login" className="text-primary hover:underline font-medium">
                {t('landing.footerLink')}
              </Link>{' '}
              {t('landing.footerAfter')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
