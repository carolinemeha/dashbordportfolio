'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Experience } from '@/lib/data';
import { Briefcase, Building, MapPin, Calendar, Target, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';

interface ExperienceFormProps {
  experience?: Experience | null;
  onSave: (data: Omit<Experience, 'id'>) => void;
  onCancel: () => void;
}

export default function ExperienceForm({
  experience,
  onSave,
  onCancel,
}: ExperienceFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Experience, 'id'>>({
    positionI18n: emptyLocaleText(),
    companyI18n: emptyLocaleText(),
    locationI18n: emptyLocaleText(),
    durationI18n: emptyLocaleText(),
    achievementsI18n: [],
    skills: [],
  });

  const [newAchievement, setNewAchievement] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (experience) {
      setFormData({
        positionI18n: experience.positionI18n,
        companyI18n: experience.companyI18n,
        locationI18n: experience.locationI18n,
        durationI18n: experience.durationI18n,
        achievementsI18n: [...experience.achievementsI18n],
        skills: [...experience.skills],
      });
    } else {
      setFormData({
        positionI18n: emptyLocaleText(),
        companyI18n: emptyLocaleText(),
        locationI18n: emptyLocaleText(),
        durationI18n: emptyLocaleText(),
        achievementsI18n: [],
        skills: [],
      });
    }
  }, [experience]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievementsI18n: [
          ...formData.achievementsI18n,
          { fr: newAchievement.trim(), en: '' },
        ],
      });
      setNewAchievement('');
    }
  };

  const removeAchievementAt = (index: number) => {
    setFormData({
      ...formData,
      achievementsI18n: formData.achievementsI18n.filter((_, i) => i !== index),
    });
  };

  const updateAchievementAt = (
    index: number,
    v: (typeof formData.achievementsI18n)[0]
  ) => {
    const next = [...formData.achievementsI18n];
    next[index] = v;
    setFormData({ ...formData, achievementsI18n: next });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            {experience ? t('forms.experience.titleEdit') : t('forms.experience.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {experience ? t('forms.experience.descEdit') : t('forms.experience.descNew')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocaleTextFieldGroup
              label={
                <>
                  {t('forms.experience.position')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.positionI18n}
              onChange={(positionI18n) => setFormData({ ...formData, positionI18n })}
              requiredFr
              inputIdPrefix="exp-position"
              placeholderFr={t('forms.experience.positionPh')}
              placeholderEn={t('forms.experience.positionPhEn')}
            />
            <LocaleTextFieldGroup
              label={
                <>
                  <Building className="h-4 w-4 text-muted-foreground inline mr-1" />
                  {t('forms.experience.company')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.companyI18n}
              onChange={(companyI18n) => setFormData({ ...formData, companyI18n })}
              requiredFr
              inputIdPrefix="exp-company"
              placeholderFr={t('forms.experience.companyPh')}
              placeholderEn={t('forms.experience.companyPhEn')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocaleTextFieldGroup
              label={
                <>
                  <Calendar className="h-4 w-4 text-muted-foreground inline mr-1" />
                  {t('forms.experience.duration')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.durationI18n}
              onChange={(durationI18n) => setFormData({ ...formData, durationI18n })}
              requiredFr
              inputIdPrefix="exp-duration"
              placeholderFr={t('forms.experience.durationPh')}
              placeholderEn={t('forms.experience.durationPhEn')}
            />
            <LocaleTextFieldGroup
              label={
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground inline mr-1" />
                  {t('forms.experience.place')}
                </>
              }
              value={formData.locationI18n}
              onChange={(locationI18n) => setFormData({ ...formData, locationI18n })}
              inputIdPrefix="exp-location"
              placeholderFr={t('forms.experience.placePh')}
              placeholderEn={t('forms.experience.placePhEn')}
            />
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />{' '}
              {t('forms.experience.achievements')}
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder={t('forms.experience.achPh')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addAchievement}>
                {t('forms.shared.add')}
              </Button>
            </div>
            <div className="space-y-3 pt-2">
              <AnimatePresence>
                {formData.achievementsI18n.map((ach, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="relative rounded-lg border border-border/40 bg-background/50 p-3 pr-10"
                  >
                    <LocaleTextFieldGroup
                      label={`${t('forms.experience.achievements')} ${index + 1}`}
                      value={ach}
                      onChange={(v) => updateAchievementAt(index, v)}
                      multiline
                      inputIdPrefix={`exp-ach-${index}`}
                      placeholderFr={t('forms.experience.achLinePh')}
                      placeholderEn={t('forms.experience.achLinePhEn')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAchievementAt(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.achievementsI18n.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  {t('forms.experience.noAch')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Label className="text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />{' '}
              {t('forms.experience.skillsUsed')}
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder={t('forms.shared.enterToAdd')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                {t('forms.shared.add')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
              <AnimatePresence>
                {formData.skills.map((skill) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge
                      variant="default"
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                      <X
                        className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.skills.length === 0 && (
                <span className="text-sm text-muted-foreground italic flex items-center">
                  {t('forms.experience.noSkills')}
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25"
            >
              {experience ? t('forms.shared.saveChanges') : t('forms.experience.addExp')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
