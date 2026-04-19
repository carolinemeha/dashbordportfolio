'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  MessageCircle,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItem } from '@/lib/admin-motion';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';




const ACTIVITY_LABEL_KEYS: Record<
  'project' | 'skill' | 'message' | 'experience' | 'education' | 'testimonial' | 'service',
  string
> = {
  project: 'dashboard.activity.typeProject',
  skill: 'dashboard.activity.typeSkill',
  message: 'dashboard.activity.typeMessage',
  experience: 'dashboard.activity.typeExperience',
  education: 'dashboard.activity.typeEducation',
  testimonial: 'dashboard.activity.typeTestimonial',
  service: 'dashboard.activity.typeService',
};

type ActivityTypeKey = keyof typeof ACTIVITY_LABEL_KEYS;

function activityTypeLabelKey(type: unknown): ActivityTypeKey | null {
  if (typeof type === 'string' && type in ACTIVITY_LABEL_KEYS) {
    return type as ActivityTypeKey;
  }
  return null;
}

export default function DashboardPage() {
  const { prefs } = useAdminPreferences();
  const { t, locale: adminLocale } = useAdminI18n();
  const dateLocale = adminLocale === 'en' ? enUS : fr;
  const numberLocale = adminLocale === 'en' ? 'en-US' : 'fr-FR';
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

  const fetchStats = useCallback(async () => {
    const [projects, experiences, skills, services, education, testimonials, messages, perf] =
      await Promise.all([
        dataService.getProjects(),
        dataService.getExperiences(),
        dataService.getSkills(),
        dataService.getServices(),
        dataService.getEducation(),
        dataService.getTestimonials(),
        dataService.getContactMessages(),
        dataService.getDashboardStats(),
      ]);

    const newMessages = messages.filter((m) => m.status === 'new');

    setStats({
      projects: projects.length,
      experiences: experiences.length,
      skills: skills.length,
      services: services.length,
      education: education.length,
      testimonials: testimonials.length,
      messages: messages.length,
      newMessages: newMessages.length,
    });
    setPerformance(perf);
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!prefs.dashboardAutoRefresh) return;
    const id = window.setInterval(() => {
      void fetchStats();
    }, 45_000);
    return () => window.clearInterval(id);
  }, [prefs.dashboardAutoRefresh, fetchStats]);

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

  const statCards = useMemo(
    () => [
      {
        title: t('dashboard.stats.projects'),
        value: stats.projects,
        icon: FolderOpen,
        description: t('dashboard.stats.projectsDesc'),
        color: 'text-blue-500',
        bgIcon: 'bg-blue-500/10',
      },
      {
        title: t('dashboard.stats.experiences'),
        value: stats.experiences,
        icon: Briefcase,
        description: t('dashboard.stats.experiencesDesc'),
        color: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10',
      },
      {
        title: t('dashboard.stats.skills'),
        value: stats.skills,
        icon: Wrench,
        description: t('dashboard.stats.skillsDesc'),
        color: 'text-violet-500',
        bgIcon: 'bg-violet-500/10',
      },
      {
        title: t('dashboard.stats.services'),
        value: stats.services,
        icon: Settings,
        description: t('dashboard.stats.servicesDesc'),
        color: 'text-orange-500',
        bgIcon: 'bg-orange-500/10',
      },
      {
        title: t('dashboard.stats.education'),
        value: stats.education,
        icon: GraduationCap,
        description: t('dashboard.stats.educationDesc'),
        color: 'text-indigo-500',
        bgIcon: 'bg-indigo-500/10',
      },
      {
        title: t('dashboard.stats.testimonials'),
        value: stats.testimonials,
        icon: MessageSquare,
        description: t('dashboard.stats.testimonialsDesc'),
        color: 'text-pink-500',
        bgIcon: 'bg-pink-500/10',
      },
      {
        title: t('dashboard.stats.messages'),
        value: stats.messages,
        icon: Mail,
        description: t('dashboard.stats.messagesNew', {
          count: stats.newMessages,
        }),
        color: stats.newMessages > 0 ? 'text-rose-500' : 'text-gray-500',
        bgIcon:
          stats.newMessages > 0 ? 'bg-rose-500/10' : 'bg-gray-500/10',
      },
    ],
    [t, stats]
  );

  return (
    <div className="space-y-8">
      {/* <AdminPageToolbar>
        <Button
          onClick={handleMigration}
          disabled={isMigrating || isMigratingImages}
          variant="outline"
          className="rounded-xl border-primary/25 hover:bg-primary/10 text-primary shadow-sm transition-colors"
        >
          {isMigrating ? (
            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Migrer les données
        </Button>
        <Button
          onClick={handleImageMigration}
          disabled={isMigrating || isMigratingImages}
          variant="outline"
          className="rounded-xl border-amber-500/25 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm transition-colors"
        >
          {isMigratingImages ? (
            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Images cloud
        </Button>
      </AdminPageToolbar> */}

      {/* Stats Grid */}
      <motion.div
        variants={adminStaggerContainer}
        initial={false}
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={adminStaggerItem}>
            <Card className="glass-card rounded-2xl border-border/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
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
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card className="glass-card rounded-2xl border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              {t('dashboard.activity.title')}
            </CardTitle>
            <CardDescription>{t('dashboard.activity.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!performance?.recentActivity || performance.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t('dashboard.activity.empty')}
                </p>
              ) : (
                performance.recentActivity.map((act: any) => {
                  const typeKey = activityTypeLabelKey(act.type);
                  return (
                  <div key={`${act.type}-${act.id}`} className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        act.type === 'project'
                          ? 'bg-blue-500/10'
                          : act.type === 'skill'
                            ? 'bg-emerald-500/10'
                            : act.type === 'message'
                              ? 'bg-violet-500/10'
                              : act.type === 'experience'
                                ? 'bg-amber-500/10'
                                : act.type === 'education'
                                  ? 'bg-indigo-500/10'
                                  : act.type === 'testimonial'
                                    ? 'bg-pink-500/10'
                                    : act.type === 'service'
                                      ? 'bg-orange-500/10'
                                      : 'bg-muted/30'
                      }`}
                    >
                      {act.type === 'project' && <Plus className="h-4 w-4 text-blue-500" />}
                      {act.type === 'skill' && <Edit className="h-4 w-4 text-emerald-500" />}
                      {act.type === 'message' && <MessageCircle className="h-4 w-4 text-violet-500" />}
                      {act.type === 'experience' && <Briefcase className="h-4 w-4 text-amber-600" />}
                      {act.type === 'education' && <GraduationCap className="h-4 w-4 text-indigo-500" />}
                      {act.type === 'testimonial' && <MessageSquare className="h-4 w-4 text-pink-500" />}
                      {act.type === 'service' && <Settings className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {typeKey ? t(ACTIVITY_LABEL_KEYS[typeKey]) : String(act.type ?? '')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {act.type === 'message' && !act.subtitle
                          ? t('dashboard.activity.noSubject')
                          : act.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {prefs.dashboardDateStyle === 'absolute'
                          ? format(new Date(act.date), 'd MMM yyyy, HH:mm', {
                              locale: dateLocale,
                            })
                          : formatDistanceToNow(new Date(act.date), {
                              addSuffix: true,
                              locale: dateLocale,
                            })}
                      </p>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {t('dashboard.performance.title')}
            </CardTitle>
            <CardDescription>{t('dashboard.performance.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {t('dashboard.performance.viewsWeek')}
                    </span>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t('dashboard.performance.viewsTotal', {
                        count:
                          performance?.totalViews != null
                            ? performance.totalViews.toLocaleString(numberLocale)
                            : '—',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-500 shrink-0 tabular-nums">
                  {performance?.viewsThisWeek != null
                    ? performance.viewsThisWeek.toLocaleString(numberLocale)
                    : '—'}
                </span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                     <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {t('dashboard.performance.cvWeek')}
                    </span>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t('dashboard.performance.cvTotal', {
                        count:
                          performance?.cvDownloads != null
                            ? performance.cvDownloads.toLocaleString(numberLocale)
                            : '—',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-500 shrink-0 tabular-nums">
                  {performance?.cvDownloadsThisWeek != null
                    ? performance.cvDownloadsThisWeek.toLocaleString(numberLocale)
                    : '—'}
                </span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-violet-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {t('dashboard.performance.visitorsWeek')}
                    </span>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {t('dashboard.performance.visitorsTotal', {
                        count:
                          performance?.uniqueVisitors != null
                            ? performance.uniqueVisitors.toLocaleString(numberLocale)
                            : '—',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-lg font-bold text-violet-500 tabular-nums">
                    {performance?.uniqueVisitorsThisWeek != null
                      ? performance.uniqueVisitorsThisWeek.toLocaleString(numberLocale)
                      : '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3" />
                    {t('dashboard.performance.ipHashHint')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}