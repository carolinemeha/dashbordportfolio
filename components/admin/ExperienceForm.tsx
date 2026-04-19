'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Experience } from '@/lib/data';
import { Briefcase, Building, MapPin, Calendar, Target, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface ExperienceFormProps {
  experience?: Experience | null;
  onSave: (data: Omit<Experience, 'id'>) => void;
  onCancel: () => void;
}

export default function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState({
    position: experience?.position || '',
    company: experience?.company || '',
    location: experience?.location || '',
    duration: experience?.duration || '',
    achievements: experience?.achievements || [],
    skills: experience?.skills || [],
  });

  const [newAchievement, setNewAchievement] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Experience, 'id'>);
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements.includes(newAchievement.trim())) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()],
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (ach: string) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((a) => a !== ach),
    });
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-foreground">
                {t('forms.experience.position')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.experience.positionPh')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" /> {t('forms.experience.company')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.experience.companyPh')}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> {t('forms.experience.duration')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.experience.durationPh')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {t('forms.experience.place')}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.experience.placePh')}
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" /> {t('forms.experience.achievements')}
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
            <div className="flex flex-col gap-2 pt-2 min-h-[32px]">
              <AnimatePresence>
                {formData.achievements.map((ach) => (
                  <motion.div
                    key={ach}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex justify-between items-center bg-background/50 border border-border/40 p-2 rounded-md text-sm"
                  >
                    <span>{ach}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAchievement(ach)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                {formData.achievements.length === 0 && (
                  <span className="text-sm text-muted-foreground italic flex items-center">
                    {t('forms.experience.noAch')}
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Label className="text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" /> {t('forms.experience.skillsUsed')}
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
                {formData.skills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic flex items-center">
                    {t('forms.experience.noSkills')}
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {experience ? t('forms.shared.saveChanges') : t('forms.experience.addExp')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
