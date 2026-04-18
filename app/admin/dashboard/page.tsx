'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService } from '@/lib/data';
import { 
  FolderOpen, 
  Briefcase, 
  Wrench, 
  Settings, 
  GraduationCap, 
  MessageSquare, 
  Mail,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Plus,
  Edit,
  Trash2,
  Zap,
  CheckCircle2,
  MessageCircle,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};




export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    experiences: 0,
    skills: 0,
    services: 0,
    education: 0,
    testimonials: 0,
    messages: 0,
    newMessages: 0
  });
  const [performance, setPerformance] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigratingImages, setIsMigratingImages] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      // Load stats
      const [projects, experiences, skills, services, education, testimonials, messages, perf] = await Promise.all([
        dataService.getProjects(),
        dataService.getExperiences(),
        dataService.getSkills(),
        dataService.getServices(),
        dataService.getEducation(),
        dataService.getTestimonials(),
        dataService.getContactMessages(),
        dataService.getDashboardStats()
      ]);

      const newMessages = messages.filter(m => m.status === 'new');

      setStats({
        projects: projects.length,
        experiences: experiences.length,
        skills: skills.length,
        services: services.length,
        education: education.length,
        testimonials: testimonials.length,
        messages: messages.length,
        newMessages: newMessages.length
      });
      setPerformance(perf);
    };

    fetchStats();
  }, []);

  const handleMigration = async () => {
    if (confirm('Voulez-vous transférer toutes vos données mockées (35+ projets, etc.) vers Supabase ? Assurez-vous d\'avoir créé les tables au préalable.')) {
      setIsMigrating(true);
      try {
        const response = await fetch('/api/migrate', {
           method: 'POST',
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Migration des données terminée avec succès !');
          window.location.reload();
        } else {
          throw new Error(result.message || 'Erreur inconnue');
        }
      } catch (error: any) {
        alert('Erreur lors de la migration : ' + error.message);
        console.error(error);
      } finally {
        setIsMigrating(false);
      }
    }
  };

  const handleImageMigration = async () => {
    if (confirm('Voulez-vous migrer toutes les images vers Supabase Storage (Cloud) ? Cette opération peut prendre quelques minutes.')) {
      setIsMigratingImages(true);
      try {
        const response = await fetch('/api/migrate-images', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
          alert(`Migration des images réussie ! ${result.filesMigrated} fichiers transférés.`);
          window.location.reload();
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        alert(`Erreur lors de la migration des images : ${error.message}`);
        console.error(error);
      } finally {
        setIsMigratingImages(false);
      }
    }
  };

  const statCards = [
    {
      title: 'Projets',
      value: stats.projects,
      icon: FolderOpen,
      description: 'Projets portfolio',
      color: 'text-blue-500',
      bgIcon: 'bg-blue-500/10'
    },
    {
      title: 'Expériences',
      value: stats.experiences,
      icon: Briefcase,
      description: 'Expériences professionnelles',
      color: 'text-emerald-500',
      bgIcon: 'bg-emerald-500/10'
    },
    {
      title: 'Compétences',
      value: stats.skills,
      icon: Wrench,
      description: 'Compétences techniques',
      color: 'text-violet-500',
      bgIcon: 'bg-violet-500/10'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: Settings,
      description: 'Services proposés',
      color: 'text-orange-500',
      bgIcon: 'bg-orange-500/10'
    },
    {
      title: 'Éducation',
      value: stats.education,
      icon: GraduationCap,
      description: 'Formations et diplômes',
      color: 'text-indigo-500',
      bgIcon: 'bg-indigo-500/10'
    },
    {
      title: 'Témoignages',
      value: stats.testimonials,
      icon: MessageSquare,
      description: 'Avis clients',
      color: 'text-pink-500',
      bgIcon: 'bg-pink-500/10'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: Mail,
      description: `${stats.newMessages} nouveau(x)`,
      color: stats.newMessages > 0 ? 'text-rose-500' : 'text-gray-500',
      bgIcon: stats.newMessages > 0 ? 'bg-rose-500/10' : 'bg-gray-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            {...({
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 }
            } as any)}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent"
          >
            Vue d'ensemble
          </motion.h1>
          <motion.p 
            {...({
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.1 }
            } as any)}
            className="mt-2 text-sm text-muted-foreground"
          >
            Bienvenue sur votre tableau de bord
          </motion.p>
        </div>
        <motion.div 
          {...({
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 }
          } as any)} 
          className="flex flex-wrap gap-2"
        >
          <Button 
            onClick={handleMigration} 
            disabled={isMigrating || isMigratingImages}
            variant="outline" 
            className="border-primary/20 hover:bg-primary/10 text-primary shadow-sm"
          >
            {isMigrating ? (
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Données
          </Button>
          <Button 
            onClick={handleImageMigration} 
            disabled={isMigrating || isMigratingImages}
            variant="outline" 
            className="border-amber-500/20 hover:bg-amber-500/10 text-amber-600 shadow-sm"
          >
            {isMigratingImages ? (
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Cloud Images
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        {...({
          variants: containerVariants,
          initial: "hidden",
          animate: "show"
        } as any)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} {...({ variants: itemVariants } as any)}>
            <Card className="glass-card border-none hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgIcon}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity & Stats Grid */}
      <motion.div 
        {...({
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.4, duration: 0.5 }
        } as any)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Dernières modifications apportées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!performance?.recentActivity || performance.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune activité récente.</p>
              ) : (
                performance.recentActivity.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-full ${
                      act.type === 'project' ? 'bg-blue-500/10' : 
                      act.type === 'skill' ? 'bg-emerald-500/10' : 'bg-violet-500/10'
                    }`}>
                      {act.type === 'project' && <Plus className="h-4 w-4 text-blue-500" />}
                      {act.type === 'skill' && <Edit className="h-4 w-4 text-emerald-500" />}
                      {act.type === 'message' && <MessageCircle className="h-4 w-4 text-violet-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{act.title}</p>
                      <p className="text-sm text-muted-foreground">{act.subtitle}</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {formatDistanceToNow(new Date(act.date), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Performances
            </CardTitle>
            <CardDescription>
              Statistiques d'engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Vues cette semaine</span>
                </div>
                <span className="text-lg font-bold text-blue-500">{performance?.totalViews?.toLocaleString() || '1,234'}</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                     <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Téléchargements CV</span>
                </div>
                <span className="text-lg font-bold text-emerald-500">{performance?.cvDownloads?.toLocaleString() || '56'}</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Visiteurs uniques</span>
                </div>
                {/* <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-violet-500">{performance?.uniqueVisitors?.toLocaleString() || '892'}</span>
                  <span className="text-[10px] text-muted-foreground">via Supabase</span>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}