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
import { Education } from '@/lib/data';
import { GraduationCap, Building, Calendar, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';

interface EducationFormProps {
  education: Education | null;
  onSave: (data: Omit<Education, 'id'>) => void;
  onCancel: () => void;
}

export default function EducationForm({
  education,
  onSave,
  onCancel,
}: EducationFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    degreeI18n: emptyLocaleText(),
    institutionI18n: emptyLocaleText(),
    durationI18n: emptyLocaleText(),
    coursesI18n: [],
  });

  const [newCourse, setNewCourse] = useState('');

  useEffect(() => {
    if (education) {
      setFormData({
        degreeI18n: education.degreeI18n,
        institutionI18n: education.institutionI18n,
        durationI18n: education.durationI18n,
        coursesI18n: [...education.coursesI18n],
      });
    } else {
      setFormData({
        degreeI18n: emptyLocaleText(),
        institutionI18n: emptyLocaleText(),
        durationI18n: emptyLocaleText(),
        coursesI18n: [],
      });
    }
  }, [education]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCourse = () => {
    if (newCourse.trim()) {
      setFormData({
        ...formData,
        coursesI18n: [...formData.coursesI18n, { fr: newCourse.trim(), en: '' }],
      });
      setNewCourse('');
    }
  };

  const removeCourseAt = (index: number) => {
    setFormData({
      ...formData,
      coursesI18n: formData.coursesI18n.filter((_, i) => i !== index),
    });
  };

  const updateCourseAt = (index: number, v: (typeof formData.coursesI18n)[0]) => {
    const next = [...formData.coursesI18n];
    next[index] = v;
    setFormData({ ...formData, coursesI18n: next });
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50 text-foreground">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            {education ? t('forms.education.titleEdit') : t('forms.education.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {education ? t('forms.education.descEdit') : t('forms.education.descNew')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocaleTextFieldGroup
              label={
                <>
                  {t('forms.education.degree')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.degreeI18n}
              onChange={(degreeI18n) => setFormData({ ...formData, degreeI18n })}
              requiredFr
              inputIdPrefix="edu-degree"
              placeholderFr={t('forms.education.degreePh')}
              placeholderEn={t('forms.education.degreePhEn')}
            />
            <LocaleTextFieldGroup
              label={
                <>
                  <Building className="h-4 w-4 text-muted-foreground inline mr-1" />
                  {t('forms.education.institution')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.institutionI18n}
              onChange={(institutionI18n) =>
                setFormData({ ...formData, institutionI18n })
              }
              requiredFr
              inputIdPrefix="edu-institution"
              placeholderFr={t('forms.education.institutionPh')}
              placeholderEn={t('forms.education.institutionPhEn')}
            />
          </div>

          <LocaleTextFieldGroup
            label={
              <>
                <Calendar className="h-4 w-4 text-muted-foreground inline mr-1" />
                {t('forms.education.duration')} <span className="text-destructive">*</span>
              </>
            }
            value={formData.durationI18n}
            onChange={(durationI18n) => setFormData({ ...formData, durationI18n })}
            requiredFr
            inputIdPrefix="edu-duration"
            placeholderFr={t('forms.education.durationPh')}
            placeholderEn={t('forms.education.durationPhEn')}
          />

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />{' '}
              {t('forms.education.courses')}
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder={t('forms.shared.enterToAdd')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCourse();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addCourse}>
                {t('forms.shared.add')}
              </Button>
            </div>
            <div className="space-y-4 pt-2">
              <AnimatePresence>
                {formData.coursesI18n.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="relative rounded-lg border border-border/40 bg-background/50 p-3 pr-10"
                  >
                    <LocaleTextFieldGroup
                      label={`${t('forms.education.courses')} ${index + 1}`}
                      value={course}
                      onChange={(v) => updateCourseAt(index, v)}
                      inputIdPrefix={`edu-course-${index}`}
                      placeholderFr={t('forms.education.courseLinePh')}
                      placeholderEn={t('forms.education.courseLinePhEn')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCourseAt(index)}
                      aria-label={t('forms.shared.cancel')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.coursesI18n.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  {t('forms.education.noCourses')}
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
              {education ? t('forms.shared.saveChanges') : t('forms.education.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
