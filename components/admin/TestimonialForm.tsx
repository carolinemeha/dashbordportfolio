'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Testimonial } from '@/lib/data';
import { MessageSquare, User, Briefcase, Star, Calendar } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

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

export default function TestimonialForm({ testimonial, onSave, onCancel }: TestimonialFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState<Omit<Testimonial, 'id'>>({
    name: '',
    role: '',
    content: '',
    rating: 5,
    avatar: '',
    date: defaultDate(),
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        rating: testimonial.rating ?? 5,
        avatar: testimonial.avatar,
        date: testimonialDateToInput(testimonial.date),
      });
    } else {
      setFormData({
        name: '',
        role: '',
        content: '',
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> {t('forms.testimonial.fullName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.testimonial.namePh')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> {t('forms.testimonial.role')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder={t('forms.testimonial.rolePh')}
                  required
                />
              </div>
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
              <Input
                id="testimonial-date"
                type="date"
                value={formData.date ?? ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 max-w-[220px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground">
                {t('forms.testimonial.content')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y"
                placeholder={t('forms.testimonial.contentPh')}
                required
              />
            </div>

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
                <span className="ml-3 font-semibold text-lg w-4 text-center">{formData.rating}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/40 sm:justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {testimonial ? t('forms.shared.saveChanges') : t('forms.testimonial.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
