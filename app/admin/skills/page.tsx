'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { dataService, Skill } from '@/lib/data';
import { Plus, Edit, Trash2, Wrench, Zap } from 'lucide-react';
import { getSkillIconComponent } from '@/lib/skill-icons';
import SkillForm from '@/components/admin/SkillForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItem } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { skillCategoryLabel } from '@/lib/admin-ui-labels';
import { pickLocalized } from '@/lib/locale-text';
import { toast } from 'sonner';

/** Même ordre que le CV public (`resume-fr.jsx` / `resume-en.jsx`). */
const SKILL_CATEGORY_ORDER: Skill['category'][] = [
  'Frontend',
  'Backend',
  'Mobile',
  'Design',
  'Commerce',
  'Autres',
];

function getOrderedCategoryEntries(
  grouped: Record<string, Skill[]>
): [string, Skill[]][] {
  const out: [string, Skill[]][] = [];
  for (const cat of SKILL_CATEGORY_ORDER) {
    const list = grouped[cat];
    if (list?.length) out.push([cat, list]);
  }
  for (const [key, list] of Object.entries(grouped)) {
    if (
      !SKILL_CATEGORY_ORDER.includes(key as Skill['category']) &&
      list?.length
    ) {
      out.push([key, list]);
    }
  }
  return out;
}

/** Classes carte compétence alignées sur `SkillsSection` du portfolio. */
const skillCardClassName =
  'group relative flex min-h-[3.75rem] items-center gap-3.5 rounded-xl border border-border/50 bg-gradient-to-br from-card/50 to-muted/15 px-4 py-3.5 pr-14 shadow-[0_1px_0_0_hsl(var(--border)/0.4)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:from-primary/[0.07] hover:to-muted/20 hover:shadow-[0_12px_40px_-16px_hsl(var(--primary)/0.35)]';

const iconBoxClassName =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.09] text-primary transition-colors duration-200 group-hover:border-primary/35 group-hover:bg-primary/[0.14] [&_svg]:block [&_svg]:h-[1.35rem] [&_svg]:w-[1.35rem]';

export default function SkillsPage() {
  const { t, locale } = useAdminI18n();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getSkills();
      setSkills(data || []);
    };
    fetchData();
  }, []);

  const handleCreate = async (skillData: Omit<Skill, 'id'>) => {
    const newSkill = await dataService.createSkill(skillData);
    if (!newSkill) {
      toast.error(t('forms.shared.saveError'));
      return;
    }
    const refreshedData = await dataService.getSkills();
    setSkills(refreshedData);
    setIsFormOpen(false);
  };

  const handleUpdate = async (id: string, updates: Partial<Skill>) => {
    const updated = await dataService.updateSkill(id, updates);
    if (!updated) {
      toast.error(t('forms.shared.saveError'));
      return;
    }
    const refreshedData = await dataService.getSkills();
    setSkills(refreshedData);
    setEditingSkill(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteSkill'))) {
      const success = await dataService.deleteSkill(id);
      if (success) {
        const refreshedData = await dataService.getSkills();
        setSkills(refreshedData);
      }
    }
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSkill(null);
  };

  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  }, [skills]);

  const orderedCategories = useMemo(
    () => getOrderedCategoryEntries(groupedSkills),
    [groupedSkills]
  );

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl shadow-md hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.skills.new')}
        </Button>
      </AdminPageToolbar>

      {skills.length === 0 ? (
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wrench className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('pages.skills.emptyTitle')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('pages.skills.emptyDesc')}
              </p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.skills.add')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
        >
          <motion.div variants={adminStaggerItem}>
            <Card className="glass-card shadow-lg overflow-hidden border-t border-l border-white/10 dark:border-white/5 rounded-2xl border-border/40">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12 [&_svg]:block">
                    <Zap
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {t('pages.skills.sectionTitle')}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t('pages.skills.sectionDesc')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-12 sm:space-y-14 pt-0">
                {orderedCategories.map(([category, categorySkills], index) => (
                  <section
                    key={category}
                    aria-labelledby={`admin-skill-cat-${category}`}
                    className={
                      index > 0 ? 'pt-2 border-t border-border/30' : ''
                    }
                  >
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <h3
                        id={`admin-skill-cat-${category}`}
                        className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs"
                      >
                        {skillCategoryLabel(category, t)}
                      </h3>
                      <span className="hidden h-px min-w-[2rem] flex-1 bg-gradient-to-r from-primary/35 to-transparent sm:block" />
                      <span
                        className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-2.5 text-[11px] font-semibold tabular-nums text-primary"
                        title={`${categorySkills.length}`}
                      >
                        {categorySkills.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <AnimatePresence>
                        {categorySkills.map((skill) => {
                          const nameShown = pickLocalized(skill.nameI18n, locale);
                          const SkillIcon = getSkillIconComponent(
                            skill.iconName,
                            nameShown
                          );
                          return (
                          <motion.div
                            key={skill.id}
                            layout
                            initial={{ opacity: 1, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            className={skillCardClassName}
                          >
                            <span className={iconBoxClassName} aria-hidden>
                              <SkillIcon className="h-[1.35rem] w-[1.35rem]" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-snug text-foreground">
                                {nameShown}
                              </span>
                            </div>
                            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-0.5 rounded-lg border border-border/40 bg-background/90 p-0.5 shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditForm(skill)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                aria-label={t('pages.skills.editSkill', { name: nameShown })}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(skill.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label={t('pages.skills.deleteSkill', { name: nameShown })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </section>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {isFormOpen && (
        <SkillForm
          key={editingSkill?.id ?? 'new'}
          skill={editingSkill}
          onSave={
            editingSkill
              ? (updates) => handleUpdate(editingSkill.id, updates)
              : handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
