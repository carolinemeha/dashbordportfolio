'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AboutInfo } from '@/lib/data';
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, AtSign, Info, Briefcase, Languages, ShoppingBag, Youtube, Tag, X, Clock, Activity, FileText, Upload, Loader2, Sparkles, BarChart3 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';

interface AboutFormProps {
  about: AboutInfo | null;
  onSave: (updates: Partial<AboutInfo>) => void;
  onCancel: () => void;
}

const emptyAboutForm = (): Partial<AboutInfo> => ({
  nameI18n: emptyLocaleText(),
  titleI18n: emptyLocaleText(),
  bioI18n: emptyLocaleText(),
  avatar: '',
  rolesI18n: [],
  locationI18n: emptyLocaleText(),
  timezoneI18n: emptyLocaleText(),
  availableStatusI18n: emptyLocaleText(),
  email: '',
  phone: '',
  experienceI18n: emptyLocaleText(),
  nationalityI18n: emptyLocaleText(),
  shopUrl: '',
  freelanceStatusI18n: emptyLocaleText(),
  languagesI18n: emptyLocaleText(),
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  cvUrl: '',
  heroBadgeI18n: emptyLocaleText(),
  homeAvailableTitleI18n: emptyLocaleText(),
  homeAvailableSubtitleI18n: emptyLocaleText(),
  homeStatYears: undefined,
  homeStatProjects: undefined,
  homeStatClients: undefined,
  homeStatSatisfaction: undefined,
  whatsappUrl: '',
  telegramUrl: '',
});

export default function AboutForm({ about, onSave, onCancel }: AboutFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Partial<AboutInfo>>(() =>
    about ? { ...about } : emptyAboutForm()
  );

  useEffect(() => {
    setFormData(about ? { ...about } : emptyAboutForm());
  }, [about]);

  const [newRole, setNewRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const addRole = () => {
    const fr = newRole.trim();
    if (
      fr &&
      !formData.rolesI18n?.some((r) => r.fr.trim() === fr)
    ) {
      setFormData({
        ...formData,
        rolesI18n: [...(formData.rolesI18n || []), { fr, en: '' }],
      });
      setNewRole('');
    }
  };

  const removeRoleAt = (index: number) => {
    setFormData({
      ...formData,
      rolesI18n: formData.rolesI18n?.filter((_, i) => i !== index),
    });
  };

  const updateRoleAt = (
    index: number,
    v: NonNullable<AboutInfo['rolesI18n']>[0]
  ) => {
    const next = [...(formData.rolesI18n || [])];
    next[index] = v;
    setFormData({ ...formData, rolesI18n: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success(t('forms.about.toastSaved'));
    } catch {
      toast.error(t('forms.about.toastSaveErr'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error(t('forms.about.toastPdfOnly'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('forms.about.toastPdfSize'));
      return;
    }
    setIsUploadingCv(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'portfolio');
      fd.append('path', 'cv');
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'upload');
      setFormData(prev => ({ ...prev, cvUrl: data.url }));
      toast.success(t('forms.about.toastCvOk'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(t('forms.about.toastUploadErr', { message }));
    } finally {
      setIsUploadingCv(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50 text-foreground sm:p-6">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {about ? t('forms.about.titleEdit') : t('forms.about.titleCreate')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('forms.about.description')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" /> {t('forms.about.sectionBase')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocaleTextFieldGroup
                label={
                  <>
                    {t('forms.about.fullName')} <span className="text-destructive">*</span>
                  </>
                }
                value={formData.nameI18n ?? emptyLocaleText()}
                onChange={(nameI18n) => setFormData({ ...formData, nameI18n })}
                requiredFr
                inputIdPrefix="about-name"
                placeholderFr={t('forms.about.fullNamePh')}
                placeholderEn={t('forms.about.fullNamePhEn')}
              />
              <LocaleTextFieldGroup
                label={
                  <>
                    {t('forms.about.jobTitle')} <span className="text-destructive">*</span>
                  </>
                }
                value={formData.titleI18n ?? emptyLocaleText()}
                onChange={(titleI18n) => setFormData({ ...formData, titleI18n })}
                requiredFr
                inputIdPrefix="about-title"
                placeholderFr={t('forms.about.jobTitlePh')}
                placeholderEn={t('forms.about.jobTitlePhEn')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> {t('forms.about.experience')}
                  </span>
                }
                value={formData.experienceI18n ?? emptyLocaleText()}
                onChange={(experienceI18n) => setFormData({ ...formData, experienceI18n })}
                inputIdPrefix="about-experience"
                placeholderFr={t('forms.about.experiencePh')}
                placeholderEn={t('forms.about.experiencePhEn')}
              />
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> {t('forms.about.nationality')}
                  </span>
                }
                value={formData.nationalityI18n ?? emptyLocaleText()}
                onChange={(nationalityI18n) => setFormData({ ...formData, nationalityI18n })}
                inputIdPrefix="about-nationality"
                placeholderFr={t('forms.about.nationalityPh')}
                placeholderEn={t('forms.about.nationalityPhEn')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {t('forms.about.freelanceStatus')}
                  </span>
                }
                value={formData.freelanceStatusI18n ?? emptyLocaleText()}
                onChange={(freelanceStatusI18n) =>
                  setFormData({ ...formData, freelanceStatusI18n })
                }
                inputIdPrefix="about-freelance"
                placeholderFr={t('forms.about.freelancePh')}
                placeholderEn={t('forms.about.freelancePhEn')}
              />
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" /> {t('forms.about.languages')}
                  </span>
                }
                value={formData.languagesI18n ?? emptyLocaleText()}
                onChange={(languagesI18n) => setFormData({ ...formData, languagesI18n })}
                inputIdPrefix="about-languages"
                placeholderFr={t('forms.about.languagesPh')}
                placeholderEn={t('forms.about.languagesPhEn')}
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                label={t('forms.about.avatarLabel')}
                value={formData.avatar || ''}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                path="avatars"
              />
            </div>

            <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label htmlFor="roles" className="text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground"/> {t('forms.about.rolesLabel')}
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.shared.enterToAdd')}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
                />
                <Button type="button" variant="secondary" onClick={addRole}>
                  {t('forms.shared.add')}
                </Button>
              </div>
              <div className="space-y-4 pt-2">
                <AnimatePresence>
                  {(formData.rolesI18n || []).map((role, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="relative rounded-lg border border-border/40 bg-background/50 p-3 pr-10"
                    >
                      <LocaleTextFieldGroup
                        label={`${t('forms.about.rolesLabel')} ${index + 1}`}
                        value={role}
                        onChange={(v) => updateRoleAt(index, v)}
                        inputIdPrefix={`about-role-${index}`}
                        placeholderFr={t('forms.about.roleLinePh')}
                        placeholderEn={t('forms.about.roleLinePhEn')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRoleAt(index)}
                        aria-label={t('forms.shared.cancel')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-xl border border-violet-500/25 bg-violet-500/5">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-violet-500" /> {t('forms.about.sectionHome')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('forms.about.homeHelp')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <LocaleTextFieldGroup
                    label={t('forms.about.heroBadge')}
                    value={formData.heroBadgeI18n ?? emptyLocaleText()}
                    onChange={(heroBadgeI18n) => setFormData({ ...formData, heroBadgeI18n })}
                    inputIdPrefix="about-hero-badge"
                    placeholderFr={t('forms.about.heroBadgePh')}
                    placeholderEn={t('forms.about.heroBadgePhEn')}
                  />
                </div>
                <LocaleTextFieldGroup
                  label={t('forms.about.homeAvailTitle')}
                  value={formData.homeAvailableTitleI18n ?? emptyLocaleText()}
                  onChange={(homeAvailableTitleI18n) =>
                    setFormData({ ...formData, homeAvailableTitleI18n })
                  }
                  inputIdPrefix="about-home-avail-title"
                  placeholderFr={t('forms.about.homeAvailTitlePh')}
                  placeholderEn={t('forms.about.homeAvailTitlePhEn')}
                />
                <LocaleTextFieldGroup
                  label={t('forms.about.homeAvailSub')}
                  value={formData.homeAvailableSubtitleI18n ?? emptyLocaleText()}
                  onChange={(homeAvailableSubtitleI18n) =>
                    setFormData({ ...formData, homeAvailableSubtitleI18n })
                  }
                  inputIdPrefix="about-home-avail-sub"
                  placeholderFr={t('forms.about.homeAvailSubPh')}
                  placeholderEn={t('forms.about.homeAvailSubPhEn')}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" /> {t('forms.about.statsBlock')}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {([
                    ['homeStatYears', 'statYears'],
                    ['homeStatProjects', 'statProjects'],
                    ['homeStatClients', 'statClients'],
                    ['homeStatSatisfaction', 'statSatisfaction'],
                  ] as const).map(([key, labelKey]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-xs text-muted-foreground">{t(`forms.about.${labelKey}`)}</Label>
                      <Input
                        id={key}
                        type="number"
                        min={0}
                        value={formData[key] === undefined || formData[key] === null ? '' : String(formData[key])}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData({
                            ...formData,
                            [key]: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0),
                          });
                        }}
                        className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsappUrl" className="text-foreground">{t('forms.about.whatsapp')}</Label>
                  <Input
                    id="whatsappUrl"
                    type="text"
                    inputMode="url"
                    value={formData.whatsappUrl || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                    className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                    placeholder="https://wa.me/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramUrl" className="text-foreground">{t('forms.about.telegram')}</Label>
                  <Input
                    id="telegramUrl"
                    type="text"
                    inputMode="url"
                    value={formData.telegramUrl || ''}
                    onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                    className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {t('forms.about.timezone')}
                  </span>
                }
                value={formData.timezoneI18n ?? emptyLocaleText()}
                onChange={(timezoneI18n) => setFormData({ ...formData, timezoneI18n })}
                inputIdPrefix="about-timezone"
                placeholderFr={t('forms.about.timezonePh')}
                placeholderEn={t('forms.about.timezonePhEn')}
              />
              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" /> {t('forms.about.availStatus')}
                  </span>
                }
                value={formData.availableStatusI18n ?? emptyLocaleText()}
                onChange={(availableStatusI18n) =>
                  setFormData({ ...formData, availableStatusI18n })
                }
                inputIdPrefix="about-available"
                placeholderFr={t('forms.about.availStatusPh')}
                placeholderEn={t('forms.about.availStatusPhEn')}
              />
            </div>

            <LocaleTextFieldGroup
              label={
                <>
                  {t('forms.about.bio')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.bioI18n ?? emptyLocaleText()}
              onChange={(bioI18n) => setFormData({ ...formData, bioI18n })}
              requiredFr
              multiline
              inputIdPrefix="about-bio"
              placeholderFr={t('forms.about.bioPh')}
              placeholderEn={t('forms.about.bioPhEn')}
            />
            
            <div className="space-y-2">
              <Label htmlFor="cvUrl" className="text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground"/> {t('forms.about.cvPdf')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="cvUrl"
                  value={formData.cvUrl || ''}
                  onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 font-mono text-xs"
                  placeholder={t('forms.about.cvUrlPh')}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={isUploadingCv}
                  className="shrink-0 border-primary/30 hover:bg-primary/5 h-10"
                >
                  {isUploadingCv ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">{isUploadingCv ? t('forms.about.uploading') : t('forms.about.upload')}</span>
                </Button>
              </div>
              {formData.cvUrl && (
                <a
                  href={formData.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                >
                  <FileText className="h-3 w-3" /> {t('forms.about.previewCv')}
                </a>
              )}
              <input
                type="file"
                ref={cvInputRef}
                onChange={handleCvUpload}
                accept="application/pdf"
                className="hidden"
              />
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5 text-primary" /> {t('forms.about.sectionCoords')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground"/> {t('forms.about.email')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground"/> {t('settings.profile.phone')}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                />
              </div>

              <LocaleTextFieldGroup
                label={
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {t('forms.about.location')}
                  </span>
                }
                value={formData.locationI18n ?? emptyLocaleText()}
                onChange={(locationI18n) => setFormData({ ...formData, locationI18n })}
                inputIdPrefix="about-location"
                placeholderFr={t('forms.about.locationPh')}
                placeholderEn={t('forms.about.locationPhEn')}
              />
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <AtSign className="h-5 w-5 text-primary" /> {t('forms.about.sectionSocial')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground"/> {t('forms.about.personalSite')}
                </Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.urlPh')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopUrl" className="text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground"/> {t('forms.about.shop')}
                </Label>
                <Input
                  id="shopUrl"
                  value={formData.shopUrl || ''}
                  onChange={(e) => setFormData({ ...formData, shopUrl: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.urlPh')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="text-foreground flex items-center gap-2">
                  <Github className="h-3.5 w-3.5 text-muted-foreground"/> GitHub
                </Label>
                <Input
                  id="github"
                  value={formData.github || ''}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-foreground flex items-center gap-2">
                  <Linkedin className="h-3.5 w-3.5 text-muted-foreground"/> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-foreground flex items-center gap-2">
                  <Twitter className="h-3.5 w-3.5 text-muted-foreground"/> {t('pages.about.twitterX')}
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter || ''}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-foreground flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-muted-foreground"/> YouTube
                </Label>
                <Input
                  id="youtube"
                  value={formData.youtube || ''}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
              {t('forms.shared.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 min-w-[160px]"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('forms.shared.saving')}</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" /> {about ? t('forms.shared.save') : t('forms.shared.createProfile')}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}