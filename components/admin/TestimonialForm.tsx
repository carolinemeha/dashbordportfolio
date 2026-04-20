'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Testimonial } from '@/lib/data';
import { MessageSquare, User, Briefcase, Star, Calendar } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { emptyLocaleText } from '@/lib/locale-text';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';

interface TestimonialFormProps {
  testimonial: Testimonial | null;
  onSave: (data: Omit<Testimonial, 'id'>) => void;
  onCancel: () => void;
}

const defaultDate = () => new Date().toISOString().slice(0, 10);

function testimonialDateToInput(d?: string) {
  if (!d) return defaultDate();
  const day = d.includes('T') ? d.split('T')[0] : d.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : defaultDate();
}

export default function TestimonialForm({
  testimonial,
  onSave,
  onCancel,
}: TestimonialFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Testimonial, 'id'>>({
    nameI18n: emptyLocaleText(),
    roleI18n: emptyLocaleText(),
    contentI18n: emptyLocaleText(),
    rating: 5,
    avatar: '',
    date: defaultDate(),
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        nameI18n: testimonial.nameI18n,
        roleI18n: testimonial.roleI18n,
        contentI18n: testimonial.contentI18n,
        rating: testimonial.rating ?? 5,
        avatar: testimonial.avatar,
        date: testimonialDateToInput(testimonial.date),
      });
    } else {
      setFormData({
        nameI18n: emptyLocaleText(),
        roleI18n: emptyLocaleText(),
        contentI18n: emptyLocaleText(),
        rating: 5,
        avatar: '',
        date: defaultDate(),
      });
    }
  }, [testimonial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<Testimonial, 'id'> = {
      ...formData,
      date: formData.date?.trim() || defaultDate(),
    };
    onSave(payload);
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-2xl glass-card border-border/50 max-h-[90vh] overflow-y-auto text-foreground sm:p-6">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            {testimonial ? t('forms.testimonial.titleEdit') : t('forms.testimonial.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('forms.testimonial.description')}
          </DialogDescription>
          <BilingualFormHint />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocaleTextFieldGroup
                label={
                  <>
                    <User className="h-4 w-4 text-muted-foreground inline mr-1" />
                    {t('forms.testimonial.fullName')} <span className="text-destructive">*</span>
                  </>
                }
                value={formData.nameI18n}
                onChange={(nameI18n) => setFormData({ ...formData, nameI18n })}
                requiredFr
                inputIdPrefix="testi-name"
                placeholderFr={t('forms.testimonial.namePh')}
                placeholderEn={t('forms.testimonial.namePhEn')}
              />

              <LocaleTextFieldGroup
                label={
                  <>
                    <Briefcase className="h-4 w-4 text-muted-foreground inline mr-1" />
                    {t('forms.testimonial.role')} <span className="text-destructive">*</span>
                  </>
                }
                value={formData.roleI18n}
                onChange={(roleI18n) => setFormData({ ...formData, roleI18n })}
                requiredFr
                inputIdPrefix="testi-role"
                placeholderFr={t('forms.testimonial.rolePh')}
                placeholderEn={t('forms.testimonial.rolePhEn')}
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                label={t('forms.testimonial.avatar')}
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                path="testimonials"
                successMessage={t('imageUpload.defaultSuccess')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> {t('forms.testimonial.date')}
              </Label>
              <input
                id="testimonial-date"
                type="date"
                value={formData.date ?? ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="flex h-10 w-full max-w-[220px] rounded-md border border-border/50 bg-secondary/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>

            <LocaleTextFieldGroup
              label={
                <>
                  {t('forms.testimonial.content')} <span className="text-destructive">*</span>
                </>
              }
              value={formData.contentI18n}
              onChange={(contentI18n) => setFormData({ ...formData, contentI18n })}
              multiline
              requiredFr
              inputIdPrefix="testi-content"
              placeholderFr={t('forms.testimonial.contentPh')}
              placeholderEn={t('forms.testimonial.contentPhEn')}
            />

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-foreground flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" /> {t('forms.testimonial.rating')}
              </Label>
              <div className="flex gap-2 items-center bg-secondary/30 border border-border/50 p-2 rounded-md w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (formData.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {testimonial ? t('forms.shared.saveChanges') : t('forms.shared.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
