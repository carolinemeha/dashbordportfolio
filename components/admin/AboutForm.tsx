'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AboutInfo } from '@/lib/data';
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, AtSign, Info, Briefcase, Languages, ShoppingBag, Youtube, Tag, X, Clock, Activity, FileText, Upload, Loader2, Sparkles, BarChart3 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface AboutFormProps {
  about: AboutInfo | null;
  onSave: (updates: Partial<AboutInfo>) => void;
  onCancel: () => void;
}

const emptyAboutForm = (): Partial<AboutInfo> => ({
  name: '',
  title: '',
  bio: '',
  avatar: '',
  roles: [],
  location: '',
  timezone: '',
  availableStatus: '',
  email: '',
  phone: '',
  experience: '',
  nationality: '',
  shopUrl: '',
  freelanceStatus: '',
  languages: '',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  cvUrl: '',
  heroBadge: '',
  homeAvailableTitle: '',
  homeAvailableSubtitle: '',
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
    if (newRole.trim() && !formData.roles?.includes(newRole.trim())) {
      setFormData({
        ...formData,
        roles: [...(formData.roles || []), newRole.trim()]
      });
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      roles: formData.roles?.filter(r => r !== role)
    });
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" /> {t('forms.about.sectionBase')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t('forms.about.fullName')} <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">{t('forms.about.jobTitle')} <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.jobTitlePh')}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground"/> {t('forms.about.experience')}
                </Label>
                <Input
                  id="experience"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.experiencePh')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground"/> {t('forms.about.nationality')}
                </Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.nationalityPh')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="freelanceStatus" className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground"/> {t('forms.about.freelanceStatus')}
                </Label>
                <Input
                  id="freelanceStatus"
                  value={formData.freelanceStatus || ''}
                  onChange={(e) => setFormData({ ...formData, freelanceStatus: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.freelancePh')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages" className="text-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground"/> {t('forms.about.languages')}
                </Label>
                <Input
                  id="languages"
                  value={formData.languages || ''}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.languagesPh')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Photo de profil"
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
              <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
                <AnimatePresence>
                  {formData.roles?.map((role) => (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge variant="default" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                        {role}
                        <X
                          className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() => removeRole(role)}
                        />
                      </Badge>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="heroBadge" className="text-foreground">{t('forms.about.heroBadge')}</Label>
                  <Input
                    id="heroBadge"
                    value={formData.heroBadge || ''}
                    onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                    className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                    placeholder={t('forms.about.heroBadgePh')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeAvailableTitle" className="text-foreground">{t('forms.about.homeAvailTitle')}</Label>
                  <Input
                    id="homeAvailableTitle"
                    value={formData.homeAvailableTitle || ''}
                    onChange={(e) => setFormData({ ...formData, homeAvailableTitle: e.target.value })}
                    className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                    placeholder={t('forms.about.homeAvailTitlePh')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeAvailableSubtitle" className="text-foreground">{t('forms.about.homeAvailSub')}</Label>
                  <Input
                    id="homeAvailableSubtitle"
                    value={formData.homeAvailableSubtitle || ''}
                    onChange={(e) => setFormData({ ...formData, homeAvailableSubtitle: e.target.value })}
                    className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                    placeholder={t('forms.about.homeAvailSubPh')}
                  />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground"/> Fuseau Horaire
                </Label>
                <Input
                  id="timezone"
                  value={formData.timezone || ''}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ex: GMT+1 (Benin Time)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableStatus" className="text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground"/> Statut de Disponibilité
                </Label>
                <Input
                  id="availableStatus"
                  value={formData.availableStatus || ''}
                  onChange={(e) => setFormData({ ...formData, availableStatus: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ex: Disponible pour de nouveaux projets"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">Biographie / À propos <span className="text-destructive">*</span></Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y"
                placeholder="Présentez-vous en quelques lignes..."
                required
              />
            </div>
            
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

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground"/> {t('forms.about.location')}
                </Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.about.locationPh')}
                />
              </div>
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