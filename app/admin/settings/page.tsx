'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import ImageUpload from '@/components/admin/ImageUpload';
import { getLandingPageOptions } from '@/lib/admin-nav';
import type { AdminLocale } from '@/lib/admin-locale';
import { motion } from 'framer-motion';
import {
  Monitor,
  Moon,
  Sun,
  User,
  Palette,
  Type,
  RotateCcw,
  Compass,
  PanelLeftClose,
  EyeOff,
  ExternalLink,
  Download,
  Upload,
  Trash2,
  CloudUpload,
  CloudDownload,
  MapPin,
  Phone,
  LayoutList,
  Megaphone,
  CalendarClock,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  resetAdminBrandPrefs,
  patchAdminPreferences,
  exportAdminPreferencesJson,
  importAdminPreferencesJson,
  resetAllAdminPreferences,
  hydratePreferencesFromCloud,
  pushPreferencesToCloudNow,
} from '@/lib/admin-preferences';

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

function toPublicHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    new URL(u);
    return u;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { prefs, refresh } = useAdminPreferences();
  const { t, locale, setLocale } = useAdminI18n();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [cloudBusy, setCloudBusy] = useState<'pull' | 'push' | null>(null);
  const [line1, setLine1] = useState('Console');
  const [line2, setLine2] = useState('Portfolio');
  const [publicDraft, setPublicDraft] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const [healthReport, setHealthReport] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLine1(prefs.brand.line1);
    setLine2(prefs.brand.line2);
  }, [prefs.brand.line1, prefs.brand.line2]);

  useEffect(() => {
    setPublicDraft(prefs.publicSiteUrl);
  }, [prefs.publicSiteUrl]);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MeResponse | null) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handlePullCloud = async () => {
    setCloudBusy('pull');
    try {
      const ok = await hydratePreferencesFromCloud();
      if (ok) {
        refresh();
        toast.success(t('settings.sync.toastPullOk'));
      } else {
        toast.message(t('settings.sync.toastPullEmpty'));
      }
    } finally {
      setCloudBusy(null);
    }
  };

  const handlePushCloud = async () => {
    setCloudBusy('push');
    try {
      const ok = await pushPreferencesToCloudNow();
      if (ok) toast.success(t('settings.sync.toastPushOk'));
      else toast.error(t('settings.sync.toastPushErr'));
    } finally {
      setCloudBusy(null);
    }
  };

  const runHealthCheck = async () => {
    setHealthLoading(true);
    setHealthReport(null);
    try {
      const res = await fetch('/api/admin/health', { credentials: 'include' });
      const data = await res.json();
      setHealthReport(JSON.stringify(data, null, 2));
      if (res.ok && data.ok) toast.success(t('settings.health.ok'));
      else toast.message(t('settings.health.done'));
    } catch {
      toast.error(t('settings.health.error'));
    } finally {
      setHealthLoading(false);
    }
  };

  const themeValue = !mounted ? 'system' : theme ?? 'system';
  const landingOptions = useMemo(() => getLandingPageOptions(t), [t]);
  const publicHref = toPublicHref(publicDraft);

  const saveBrand = () => {
    patchAdminPreferences({ brand: { ...prefs.brand, line1, line2 } });
    toast.success(t('settings.sidebar.toastLabelsSaved'));
  };

  const resetBrand = () => {
    resetAdminBrandPrefs();
    setLine1('Console');
    setLine2('Portfolio');
    toast.success(t('settings.sidebar.toastLabelsReset'));
  };

  const savePublicUrl = () => {
    patchAdminPreferences({ publicSiteUrl: publicDraft });
    toast.success(t('settings.publicSite.toastUrlSaved'));
  };

  const exportPrefs = () => {
    const json = exportAdminPreferencesJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('settings.backup.toastExported'));
  };

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      const r = importAdminPreferencesJson(text);
      if (r.ok) {
        toast.success(t('settings.backup.toastImported'));
      } else {
        toast.error(r.error);
      }
    });
  };

  const confirmResetAll = () => {
    resetAllAdminPreferences();
    setLine1('Console');
    setLine2('Portfolio');
    setPublicDraft('');
    toast.success(t('settings.backup.toastResetLocal'));
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t('locale.label')}
              </CardTitle>
              <CardDescription>{t('locale.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="admin-locale">{t('locale.label')}</Label>
              <Select
                value={locale}
                onValueChange={(v) => setLocale(v as AdminLocale)}
              >
                <SelectTrigger
                  id="admin-locale"
                  className="bg-secondary/30 border-border/50 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t('locale.fr')}</SelectItem>
                  <SelectItem value="en">{t('locale.en')}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.02 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>{t('settings.appearance.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup
                value={themeValue}
                onValueChange={(v) => setTheme(v)}
                className="grid gap-3"
                disabled={!mounted}
              >
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value="light" id="theme-light" />
                  <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{t('settings.appearance.light')}</span>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.appearance.lightDesc')}
                    </p>
                  </div>
                </label>
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Moon className="h-4 w-4 text-sky-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{t('settings.appearance.dark')}</span>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.appearance.darkDesc')}
                    </p>
                  </div>
                </label>
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value="system" id="theme-system" />
                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{t('settings.appearance.system')}</span>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.appearance.systemDesc')}
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                {t('settings.sidebar.title')}
              </CardTitle>
              <CardDescription>{t('settings.sidebar.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <ImageUpload
                compact
                label={t('settings.sidebar.logoLabel')}
                value={prefs.brand.logoUrl}
                onChange={(url) =>
                  patchAdminPreferences({ brand: { ...prefs.brand, logoUrl: url } })
                }
                path="admin/sidebar-logo"
                successMessage={t('settings.sidebar.logoUploaded')}
              />
              <div className="space-y-2">
                <Label htmlFor="brand-line1">{t('settings.sidebar.line1')}</Label>
                <Input
                  id="brand-line1"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  maxLength={28}
                  className="bg-secondary/30 border-border/50"
                  placeholder="Console"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-line2">{t('settings.sidebar.line2')}</Label>
                <Input
                  id="brand-line2"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  maxLength={36}
                  className="bg-secondary/30 border-border/50"
                  placeholder="Portfolio"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" onClick={saveBrand} className="rounded-xl">
                  {t('settings.sidebar.saveLabels')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetBrand}
                  className="rounded-xl gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('settings.sidebar.resetLabels')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                {t('settings.navigation.title')}
              </CardTitle>
              <CardDescription>{t('settings.navigation.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="landing-path">{t('settings.navigation.landingLabel')}</Label>
              <Select
                value={prefs.landingPath}
                onValueChange={(v) => {
                  patchAdminPreferences({ landingPath: v });
                  toast.success(t('settings.navigation.toastLanding'));
                }}
              >
                <SelectTrigger
                  id="landing-path"
                  className="bg-secondary/30 border-border/50 rounded-xl"
                >
                  <SelectValue placeholder={t('settings.navigation.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {landingOptions.map((opt) => (
                    <SelectItem key={opt.href} value={opt.href}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.07 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <PanelLeftClose className="h-5 w-5 text-primary" />
                {t('settings.interface.title')}
              </CardTitle>
              <CardDescription>{t('settings.interface.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{t('settings.interface.sidebarCompact')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.interface.sidebarCompactDesc')}
                  </p>
                </div>
                <Switch
                  checked={prefs.sidebarCompact}
                  onCheckedChange={(v) => {
                    patchAdminPreferences({ sidebarCompact: v });
                    toast.success(v ? t('settings.interface.compactOn') : t('settings.interface.compactOff'));
                  }}
                  aria-label={t('settings.interface.sidebarCompact')}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {t('settings.interface.reduceMotion')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.interface.reduceMotionDesc')}
                  </p>
                </div>
                <Switch
                  checked={prefs.reduceMotion}
                  onCheckedChange={(v) => {
                    patchAdminPreferences({ reduceMotion: v });
                    toast.success(
                      v ? t('settings.interface.motionOn') : t('settings.interface.motionOff')
                    );
                  }}
                  aria-label={t('settings.interface.reduceMotion')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.075 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutList className="h-5 w-5 text-primary" />
                {t('settings.layout.title')}
              </CardTitle>
              <CardDescription>{t('settings.layout.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label htmlFor="density-select">{t('settings.layout.density')}</Label>
              <Select
                value={prefs.density}
                onValueChange={(v: 'comfortable' | 'compact') => {
                  patchAdminPreferences({ density: v });
                  toast.success(
                    v === 'compact' ? t('settings.layout.toastCompact') : t('settings.layout.toastComfortable')
                  );
                }}
              >
                <SelectTrigger
                  id="density-select"
                  className="bg-secondary/30 border-border/50 rounded-xl"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">{t('settings.layout.comfortable')}</SelectItem>
                  <SelectItem value="compact">{t('settings.layout.compact')}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                {t('settings.banner.title')}
              </CardTitle>
              <CardDescription>{t('settings.banner.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header-banner">{t('settings.banner.bannerLabel')}</Label>
                <Textarea
                  id="header-banner"
                  value={prefs.headerBanner}
                  onChange={(e) =>
                    patchAdminPreferences({ headerBanner: e.target.value })
                  }
                  maxLength={200}
                  rows={3}
                  placeholder={t('settings.banner.bannerPlaceholder')}
                  className="bg-secondary/30 border-border/50 rounded-xl resize-y min-h-[4.5rem]"
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {t('settings.banner.chars', { n: prefs.headerBanner.length })}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{t('settings.banner.headerMinimal')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.banner.headerMinimalDesc')}
                  </p>
                </div>
                <Switch
                  checked={prefs.headerMinimal}
                  onCheckedChange={(v) => {
                    patchAdminPreferences({ headerMinimal: v });
                    toast.success(v ? t('settings.banner.minimalOn') : t('settings.banner.minimalOff'));
                  }}
                  aria-label={t('settings.banner.headerMinimal')}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{t('settings.banner.routeCrumb')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.banner.routeCrumbDesc')}
                  </p>
                </div>
                <Switch
                  checked={prefs.showRouteCrumb}
                  onCheckedChange={(v) => {
                    patchAdminPreferences({ showRouteCrumb: v });
                    toast.success(v ? t('settings.banner.routeOn') : t('settings.banner.routeOff'));
                  }}
                  aria-label={t('settings.banner.routeCrumb')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.085 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                {t('settings.dashboardPrefs.title')}
              </CardTitle>
              <CardDescription>{t('settings.dashboardPrefs.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dash-date-style">{t('settings.dashboardPrefs.dateStyle')}</Label>
                <Select
                  value={prefs.dashboardDateStyle}
                  onValueChange={(v: 'relative' | 'absolute') => {
                    patchAdminPreferences({ dashboardDateStyle: v });
                    toast.success(
                      v === 'absolute'
                        ? t('settings.dashboardPrefs.toastAbsolute')
                        : t('settings.dashboardPrefs.toastRelative')
                    );
                  }}
                >
                  <SelectTrigger
                    id="dash-date-style"
                    className="bg-secondary/30 border-border/50 rounded-xl"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relative">{t('settings.dashboardPrefs.relative')}</SelectItem>
                    <SelectItem value="absolute">{t('settings.dashboardPrefs.absolute')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/15 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{t('settings.dashboardPrefs.autoRefresh')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.dashboardPrefs.autoRefreshDesc')}
                  </p>
                </div>
                <Switch
                  checked={prefs.dashboardAutoRefresh}
                  onCheckedChange={(v) => {
                    patchAdminPreferences({ dashboardAutoRefresh: v });
                    toast.success(
                      v ? t('settings.dashboardPrefs.autoOn') : t('settings.dashboardPrefs.autoOff')
                    );
                  }}
                  aria-label={t('settings.dashboardPrefs.autoRefresh')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.09 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                {t('settings.health.title')}
              </CardTitle>
              <CardDescription>{t('settings.health.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl gap-2"
                disabled={healthLoading}
                onClick={() => void runHealthCheck()}
              >
                {healthLoading ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Stethoscope className="h-4 w-4" />
                )}
                {t('settings.health.run')}
              </Button>
              {healthReport ? (
                <pre className="text-[11px] leading-relaxed overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-4 font-mono whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                  {healthReport}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.095 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                {t('settings.publicSite.title')}
              </CardTitle>
              <CardDescription>{t('settings.publicSite.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-url">{t('settings.publicSite.urlLabel')}</Label>
                <Input
                  id="public-url"
                  value={publicDraft}
                  onChange={(e) => setPublicDraft(e.target.value)}
                  maxLength={512}
                  className="bg-secondary/30 border-border/50"
                  placeholder={t('settings.publicSite.placeholder')}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={savePublicUrl} className="rounded-xl">
                  {t('settings.publicSite.saveUrl')}
                </Button>
                {publicHref ? (
                  <Button variant="outline" className="rounded-xl gap-2" asChild>
                    <a href={publicHref} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {t('settings.publicSite.openNew')}
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl gap-2"
                    disabled
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('settings.publicSite.openNew')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.09 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {t('settings.backup.title')}
              </CardTitle>
              <CardDescription>{t('settings.backup.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportPrefs}
                  className="rounded-xl gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('settings.backup.export')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => importRef.current?.click()}
                  className="rounded-xl gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {t('settings.backup.import')}
                </Button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={onImportFile}
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('settings.backup.resetAll')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.backup.resetTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('settings.backup.resetDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmResetAll}>
                      {t('settings.backup.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.095 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudDownload className="h-5 w-5 text-primary" />
                {t('settings.sync.title')}
              </CardTitle>
              <CardDescription>{t('settings.sync.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl gap-2"
                disabled={cloudBusy !== null}
                onClick={handlePullCloud}
              >
                {cloudBusy === 'pull' ? (
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4" />
                )}
                {t('settings.sync.pull')}
              </Button>
              <Button
                type="button"
                className="rounded-xl gap-2"
                disabled={cloudBusy !== null}
                onClick={handlePushCloud}
              >
                {cloudBusy === 'push' ? (
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                {t('settings.sync.push')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>{t('settings.profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 ring-1 ring-primary/20 overflow-hidden shrink-0 flex items-center justify-center">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-primary/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-4">
                    <dl className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                      <div className="sm:col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t('settings.profile.displayName')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{user.name}</dd>
                      </div>
                      {user.title ? (
                        <div className="sm:col-span-2">
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('settings.profile.jobTitle')}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{user.title}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t('settings.profile.emailPublic')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-foreground break-all">
                          {user.publicEmail ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t('settings.profile.emailLogin')}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-foreground break-all">
                          {user.sessionEmail || user.email}
                        </dd>
                      </div>
                      {user.phone ? (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {t('settings.profile.phone')}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{user.phone}</dd>
                        </div>
                      ) : null}
                      {user.location ? (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {t('settings.profile.location')}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{user.location}</dd>
                        </div>
                      ) : null}
                      {user.role ? (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('settings.profile.role')}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{user.role}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <Button variant="outline" className="rounded-xl" asChild>
                      <Link href="/admin/about">{t('settings.profile.editPublic')}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('settings.profile.loading')}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
