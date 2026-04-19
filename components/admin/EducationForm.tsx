'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Education } from '@/lib/data';
import { GraduationCap, Building, Calendar, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface EducationFormProps {
  education: Education | null;
  onSave: (data: Omit<Education, 'id'>) => void;
  onCancel: () => void;
}

export default function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    degree: '',
    institution: '',
    duration: '',
    courses: [],
  });

  const [newCourse, setNewCourse] = useState('');

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        institution: education.institution || '',
        duration: education.duration || '',
        courses: education.courses || [],
      });
    }
  }, [education]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCourse = () => {
    if (newCourse.trim() && !formData.courses.includes(newCourse.trim())) {
      setFormData({
        ...formData,
        courses: [...formData.courses, newCourse.trim()],
      });
      setNewCourse('');
    }
  };

  const removeCourse = (course: string) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((c) => c !== course),
    });
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-foreground">
                {t('forms.education.degree')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.education.degreePh')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" /> {t('forms.education.institution')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.education.institutionPh')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> {t('forms.education.duration')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              placeholder={t('forms.education.durationPh')}
              required
            />
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" /> {t('forms.education.courses')}
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
            <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
              <AnimatePresence>
                {formData.courses.map((course) => (
                  <motion.div
                    key={course}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge
                      variant="default"
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {course}
                      <X
                        className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => removeCourse(course)}
                      />
                    </Badge>
                  </motion.div>
                ))}
                {formData.courses.length === 0 && (
                  <span className="text-sm text-muted-foreground italic flex items-center">
                    {t('forms.education.noCourses')}
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
              {education ? t('forms.shared.saveChanges') : t('forms.education.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
