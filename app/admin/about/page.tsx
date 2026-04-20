'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dataService, AboutInfo } from '@/lib/data';
import { Edit, User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, AtSign, Info, Briefcase, Languages, ShoppingBag, Youtube, Sparkles, BarChart3 } from 'lucide-react';
import AboutForm from '@/components/admin/AboutForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, FileText } from 'lucide-react';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItem } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { pickLocalized } from '@/lib/locale-text';
import type { AdminLocale } from '@/lib/admin-locale';
import { toast } from 'sonner';

const HOME_STATS_DEFAULT = {
  years: 8,
  projects: 15,
  clients: 12,
  satisfaction: 100,
} as const;

/** Textes effectifs pour l’aperçu « Accueil » (même logique de repli que la vitrine). */
function aboutHomePreview(about: AboutInfo, locale: AdminLocale) {
  const pastille =
    pickLocalized(about.heroBadgeI18n, locale).trim() ||
    pickLocalized(about.nameI18n, locale).trim() ||
    '—';

  const dispoTitle =
    pickLocalized(about.homeAvailableTitleI18n, locale).trim() ||
    pickLocalized(about.freelanceStatusI18n, locale).trim() ||
    '';
  const dispoSub = pickLocalized(about.homeAvailableSubtitleI18n, locale).trim() || '';
  const statusFull = pickLocalized(about.availableStatusI18n, locale).trim() || '';

  let title = dispoTitle;
  let subtitle = dispoSub;
  if (!title && statusFull) {
    title = statusFull;
  } else if (title && !subtitle && statusFull && statusFull !== title) {
    subtitle = statusFull;
  }
  if (!title) title = '—';
  if (!subtitle) subtitle = '—';

  return {
    pastille,
    dispoTitle: title,
    dispoSub: subtitle,
    statYears: about.homeStatYears ?? HOME_STATS_DEFAULT.years,
    statProjects: about.homeStatProjects ?? HOME_STATS_DEFAULT.projects,
    statClients: about.homeStatClients ?? HOME_STATS_DEFAULT.clients,
    statSatisfaction:
      about.homeStatSatisfaction ?? HOME_STATS_DEFAULT.satisfaction,
  };
}

function AboutHomePreviewCard({ about }: { about: AboutInfo }) {
  const { t, locale } = useAdminI18n();
  const h = aboutHomePreview(about, locale);
  return (
    <Card className="glass-card border-violet-500/20">
      <CardHeader className="pb-3 border-b border-border/30 bg-violet-500/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          {t('pages.about.homePreviewTitle')}
        </CardTitle>
        <CardDescription>
          {t('pages.about.homePreviewDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm">
        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pages.about.badgeLabel')}
          </p>
          <p className="font-medium text-foreground">{h.pastille}</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pages.about.availabilityBlock')}
          </p>
          <p className="font-medium text-foreground">
            <span>{h.dispoTitle}</span>
            <span className="text-muted-foreground mx-1.5">·</span>
            <span>{h.dispoSub}</span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 w-full max-w-sm">
            <span className="text-muted-foreground">{t('pages.about.statExp')}</span>
            <span className="font-medium tabular-nums">{h.statYears}</span>
            <span className="text-muted-foreground">{t('pages.about.statProjects')}</span>
            <span className="font-medium tabular-nums">{h.statProjects}</span>
            <span className="text-muted-foreground">{t('pages.about.statClients')}</span>
            <span className="font-medium tabular-nums">{h.statClients}</span>
            <span className="text-muted-foreground">{t('pages.about.statSatisfaction')}</span>
            <span className="font-medium tabular-nums">{h.statSatisfaction}%</span>
          </div>
        </div>
        {(about.whatsappUrl || about.telegramUrl) && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
            {t('pages.about.contactHint')} {about.whatsappUrl ? t('pages.about.whatsappOk') : ''}
            {about.whatsappUrl && about.telegramUrl ? ' · ' : ''}
            {about.telegramUrl ? t('pages.about.telegramOk') : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AboutPage() {
  const { t, locale } = useAdminI18n();
  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const aboutData = await dataService.getAboutInfo();
      setAbout(aboutData);
    };
    fetchData();
  }, []);

  const handleUpdate = async (updates: Partial<AboutInfo>) => {
    const updatedAbout = await dataService.updateAboutInfo(updates);
    if (!updatedAbout) {
      toast.error(t('forms.shared.saveError'));
      throw new Error('about save failed');
    }
    setAbout(updatedAbout);
    setIsFormOpen(false);
  };

  const openEditForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button onClick={openEditForm} className="rounded-xl shadow-md hover:shadow-primary/20 transition-all">
          <Edit className="h-4 w-4 mr-2" />
          {about ? t('pages.about.editProfile') : t('pages.about.createProfile')}
        </Button>
      </AdminPageToolbar>

      {!about ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <User className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.about.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.about.emptyDesc')}</p>
              <Button onClick={openEditForm} size="lg">
                <Edit className="h-4 w-4 mr-2" />
                {t('pages.about.addInfo')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={adminStaggerItem} className="lg:col-span-1 space-y-6">
            {/* Profil Rapide */}
            <Card className="glass-card overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
              <CardContent className="pt-10 flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background shadow-xl flex items-center justify-center mb-4 overflow-hidden relative">
                   {about.avatar ? (
                     <img src={about.avatar} alt={pickLocalized(about.nameI18n, locale)} className="w-full h-full object-cover" />
                   ) : (
                    <User className="h-10 w-10 text-muted-foreground opacity-50" />
                   )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{pickLocalized(about.nameI18n, locale)}</h2>
                <p className="text-primary font-medium mt-1">{pickLocalized(about.titleI18n, locale)}</p>
                
                {about.rolesI18n.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3 px-4">
                    {about.rolesI18n.map((role, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 px-2">
                        {pickLocalized(role, locale)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="w-full h-px bg-border/40 my-6"></div>
                
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('pages.about.email')}</p>
                      <p className="text-sm font-medium text-foreground/80 truncate">{about.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('pages.about.phone')}</p>
                      <p className="text-sm font-medium text-foreground/80">{about.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('pages.about.location')}</p>
                      <p className="text-sm font-medium text-foreground/80">{pickLocalized(about.locationI18n, locale)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations additionnelles */}
            <Card className="glass-card">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  {t('pages.about.keyInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('pages.about.experience')}</span>
                  </div>
                  <span className="text-sm font-semibold">{pickLocalized(about.experienceI18n, locale) || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Nationalité</span>
                  </div>
                  <span className="text-sm font-semibold">{pickLocalized(about.nationalityI18n, locale) || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('pages.about.freelance')}</span>
                  </div>
                  <span className="text-sm font-semibold">{pickLocalized(about.freelanceStatusI18n, locale) || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('pages.about.timezone')}</span>
                  </div>
                  <span className="text-sm font-semibold">{pickLocalized(about.timezoneI18n, locale) || "-"}</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3 mb-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('pages.about.availability')}</span>
                  </div>
                  <p className="text-sm font-semibold pl-7">{pickLocalized(about.availableStatusI18n, locale) || "-"}</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3 mb-1">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('pages.about.languages')}</span>
                  </div>
                  <p className="text-sm font-semibold pl-7">{pickLocalized(about.languagesI18n, locale) || "-"}</p>
                </div>
                {about.cvUrl && (
                  <Button variant="outline" size="sm" className="w-full mt-2 border-primary/20 hover:bg-primary/5 group" asChild>
                    <a href={about.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {t('pages.about.downloadCv')}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <AboutHomePreviewCard about={about} />

            {/* Réseaux Sociaux */}
            <Card className="glass-card">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-primary" />
                  {t('pages.about.onlinePresence')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-1">
                {about.website && (
                  <a href={about.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">{t('pages.about.siteWeb')}</span>
                    </div>
                  </a>
                )}
                {about.shopUrl && (
                  <a href={about.shopUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">{t('pages.about.shop')}</span>
                    </div>
                  </a>
                )}
                {about.github && (
                  <a href={about.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">GitHub</span>
                    </div>
                  </a>
                )}
                {about.linkedin && (
                  <a href={about.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">LinkedIn</span>
                    </div>
                  </a>
                )}
                {about.twitter && (
                  <a href={about.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-[#1DA1F2] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">{t('pages.about.twitterX')}</span>
                    </div>
                  </a>
                )}
                {about.youtube && (
                  <a href={about.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Youtube className="h-5 w-5 text-muted-foreground group-hover:text-[#FF0000] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">YouTube</span>
                    </div>
                  </a>
                )}
                {(!about.website && !about.github && !about.linkedin && !about.twitter && !about.youtube && !about.shopUrl) && (
                  <p className="text-sm text-muted-foreground italic">{t('pages.about.noLinks')}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={adminStaggerItem} className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {t('pages.about.bioTitle')}
                </CardTitle>
                <CardDescription>
                  {t('pages.about.bioDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {pickLocalized(about.bioI18n, locale) || t('pages.about.noBio')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {isFormOpen && (
        <AboutForm
          key={about ? 'edit' : 'create'}
          about={about}
          onSave={handleUpdate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}