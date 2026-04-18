'use client';

import { motion, Variants } from 'framer-motion';
import { Settings, Shield, LayoutDashboard, ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Decorative premium background */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[bottom_1px_center]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[800px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px] opacity-50 dark:opacity-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 relative z-10">
        <motion.div 
          className="text-center space-y-10"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-primary bg-primary/10 ring-1 ring-inset ring-primary/20 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Admin Dashboard 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Portfolio
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent ml-3 drop-shadow-sm">
                Admin
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tableau de bord administrateur premium pour gérer votre portfolio personnel. Rapide, sécurisé et conçu avec des standards modernes.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
              <Link href="/admin/dashboard">
                Accéder au Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-secondary transition-all">
              <Link href="/admin/login">
                Espace Connexion
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                <Settings className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Gestion complète</h3>
              <p className="text-muted-foreground leading-relaxed">
                Opérations CRUD complètes pour contrôler parfaitement vos projets, expériences, compétences et services.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20">
                <Shield className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Sécurisé & Privé</h3>
              <p className="text-muted-foreground leading-relaxed">
                Authentification robuste et protection stricte des routes pour préserver l'intégrité de vos données.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border border-border/50 bg-background/40">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-indigo-500/20">
                <LayoutDashboard className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Interface Moderne</h3>
              <p className="text-muted-foreground leading-relaxed">
                Design fluide et responsive propulsé par Shadcn UI, Tailwind CSS et des animations Framer Motion.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 pt-16 border-t border-border/30">
            <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary/30 to-indigo-500/30">
              <div className="px-6 py-4 bg-background/80 backdrop-blur-xl rounded-xl border border-border/40 min-w-[300px]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Code de Démo</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between items-center px-4 py-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-mono font-medium text-foreground">admin@portfolio.com</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Mot de passe</span>
                    <span className="font-mono font-medium text-foreground">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}