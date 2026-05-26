'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Testimonial } from '@/lib/data';
import { Plus, Edit, Trash2, MessageSquare, Star, User, Briefcase, Check, Mail } from 'lucide-react';
import TestimonialForm from '@/components/admin/TestimonialForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItem } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { pickLocalized } from '@/lib/locale-text';
import { toast } from 'sonner';

function TestimonialAvatar({ name, src }: { name: string; src: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [src]);
  if (!src?.trim() || broken) {
    return <User className="w-5 h-5 text-muted-foreground" aria-hidden />;
  }
  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

function TestimonialCard({
  testimonial,
  locale,
  dateLocale,
  t,
  onEdit,
  onDelete,
  onApprove,
  pending,
}: {
  testimonial: Testimonial;
  locale: 'fr' | 'en';
  dateLocale: string;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  pending?: boolean;
}) {
  const nameShown = pickLocalized(testimonial.nameI18n, locale);
  const roleShown = pickLocalized(testimonial.roleI18n, locale);
  const contentShown = pickLocalized(testimonial.contentI18n, locale);

  return (
    <motion.div variants={adminStaggerItem} layout exit={{ opacity: 0, scale: 0.9 }}>
      <Card
        className={`glass-card h-full flex flex-col hover:border-primary/50 transition-colors group text-foreground ${
          pending ? 'border-amber-500/40' : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border flex items-center justify-center shrink-0">
                <TestimonialAvatar name={nameShown} src={testimonial.avatar ?? ''} />
              </div>
              <div className="overflow-hidden min-w-0">
                <CardTitle className="text-base leading-tight truncate">{nameShown}</CardTitle>
                <CardDescription className="text-xs mt-0.5 truncate flex items-center gap-1">
                  <Briefcase className="h-3 w-3 shrink-0 opacity-70" />
                  {roleShown || '—'}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {pending ? (
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                  {t('pages.testimonials.pendingBadge')}
                </Badge>
              ) : null}
              {testimonial.source === 'vitrine' ? (
                <Badge variant="secondary" className="text-[10px]">
                  {t('pages.testimonials.fromVitrine')}
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {testimonial.rating !== undefined && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (testimonial.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="text-foreground/80 italic text-sm leading-relaxed line-clamp-4">
              &ldquo;{contentShown}&rdquo;
            </p>
            {testimonial.submitterEmail ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {testimonial.submitterEmail}
              </p>
            ) : null}
          </div>
          <div className="mt-6 pt-4 border-t border-border/40 flex flex-wrap gap-2 justify-between items-center">
            {testimonial.date ? (
              <Badge variant="secondary" className="bg-secondary/50 font-normal text-xs">
                {new Date(testimonial.date).toLocaleDateString(dateLocale, {
                  month: 'long',
                  year: 'numeric',
                })}
              </Badge>
            ) : (
              <span />
            )}
            <div className="flex gap-1">
              {pending && onApprove ? (
                <Button size="sm" className="h-8 gap-1" onClick={onApprove}>
                  <Check className="h-3.5 w-3.5" />
                  {t('pages.testimonials.approve')}
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TestimonialsPage() {
  const { t, dateLocale, locale } = useAdminI18n();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const refresh = async () => {
    const data = await dataService.getTestimonials();
    setTestimonials(data || []);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const { pending, published } = useMemo(() => {
    const pend: Testimonial[] = [];
    const pub: Testimonial[] = [];
    for (const item of testimonials) {
      if (item.published === false) pend.push(item);
      else pub.push(item);
    }
    const sortFn = (a: Testimonial, b: Testimonial) => {
      const so = (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
      if (so !== 0) return so;
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    };
    pend.sort(sortFn);
    pub.sort(sortFn);
    return { pending: pend, published: pub };
  }, [testimonials]);

  const handleCreate = async (testimonialData: Omit<Testimonial, 'id'>) => {
    const newTestimonial = await dataService.createTestimonial({
      ...testimonialData,
      published: testimonialData.published !== false,
      source: 'admin',
    });
    if (!newTestimonial) {
      toast.error(t('forms.shared.saveError'));
      return;
    }
    await refresh();
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  const handleUpdate = async (id: string, updates: Partial<Testimonial>) => {
    const updated = await dataService.updateTestimonial(id, updates);
    if (!updated) {
      toast.error(t('forms.shared.saveError'));
      return;
    }
    await refresh();
    setEditingTestimonial(null);
    setIsFormOpen(false);
  };

  const handleApprove = async (id: string) => {
    const updated = await dataService.approveTestimonial(id);
    if (!updated) {
      toast.error(t('pages.testimonials.approveError'));
      return;
    }
    toast.success(t('pages.testimonials.approveSuccess'));
    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteTestimonial'))) {
      const success = await dataService.deleteTestimonial(id);
      if (success) await refresh();
    }
  };

  const openEditForm = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingTestimonial(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button onClick={openCreateForm} className="rounded-xl shadow-md hover:shadow-primary/20 transition-all">
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.testimonials.new')}
        </Button>
      </AdminPageToolbar>

      {pending.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              {t('pages.testimonials.pendingTitle')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('pages.testimonials.pendingDesc')}</p>
          </div>
          <motion.div
            variants={adminStaggerContainer}
            initial={false}
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {pending.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  locale={locale}
                  dateLocale={dateLocale}
                  t={t}
                  pending
                  onApprove={() => void handleApprove(testimonial.id)}
                  onEdit={() => openEditForm(testimonial)}
                  onDelete={() => void handleDelete(testimonial.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {testimonials.length === 0 ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-foreground">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.testimonials.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.testimonials.emptyDesc')}</p>
              <Button onClick={openCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.testimonials.add')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : published.length > 0 ? (
        <section className="space-y-4">
          {pending.length > 0 ? (
            <h2 className="text-lg font-semibold">{t('pages.testimonials.publishedTitle')}</h2>
          ) : null}
          <motion.div
            variants={adminStaggerContainer}
            initial={false}
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {published.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  locale={locale}
                  dateLocale={dateLocale}
                  t={t}
                  onEdit={() => openEditForm(testimonial)}
                  onDelete={() => void handleDelete(testimonial.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      ) : null}

      {isFormOpen && (
        <TestimonialForm
          key={editingTestimonial?.id ?? 'new'}
          testimonial={editingTestimonial}
          onSave={
            editingTestimonial
              ? (updates) => handleUpdate(editingTestimonial.id, updates)
              : handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
