'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Experience } from '@/lib/data';
import { Plus, Edit, Trash2, Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import ExperienceForm from '@/components/admin/ExperienceForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItemExit } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

export default function ExperiencesPage() {
  const { t } = useAdminI18n();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getExperiences();
      setExperiences(data || []);
    };
    fetchData();
  }, []);

  const handleCreate = async (experienceData: Omit<Experience, 'id'>) => {
    const newExperience = await dataService.createExperience(experienceData);
    if (newExperience) {
      const refreshedData = await dataService.getExperiences();
      setExperiences(refreshedData);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Experience>) => {
    const updated = await dataService.updateExperience(id, updates);
    if (updated) {
      const refreshedData = await dataService.getExperiences();
      setExperiences(refreshedData);
      setEditingExperience(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteExperience'))) {
      const success = await dataService.deleteExperience(id);
      if (success) {
        const refreshedData = await dataService.getExperiences();
        setExperiences(refreshedData);
      }
    }
  };

  const openEditForm = (experience: Experience) => {
    setEditingExperience(experience);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExperience(null);
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl shadow-md hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.experiences.new')}
        </Button>
      </AdminPageToolbar>

      {experiences.length === 0 ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Briefcase className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.experiences.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.experiences.emptyDesc')}</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.experiences.add')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
          className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent"
        >
          <AnimatePresence>
            {experiences.map((experience) => (
              <motion.div key={experience.id} variants={adminStaggerItemExit} exit="exit" layout className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow md:mx-auto relative z-10 box-content transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Briefcase className="h-4 w-4" />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pb-4">
                  <Card className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative h-full">
                    <CardHeader className="pb-3 bg-secondary/10 border-b border-border/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground">{experience.position}</CardTitle>
                          <CardDescription className="font-medium text-primary/80 mt-1">{experience.company}</CardDescription>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border/50 rounded-lg p-0.5 shadow-sm">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(experience)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(experience.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center text-xs font-medium text-muted-foreground bg-secondary/40 w-fit px-2.5 py-1 rounded-md border border-border/30">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                        <span>{experience.duration}</span>
                      </div>
                      <div className="text-sm text-foreground/80 space-y-1 mt-2">
                         {experience.achievements && experience.achievements.length > 0 ? (
                           experience.achievements.map((ach, idx) => (
                             <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{ach}</span>
                             </div>
                           ))
                         ) : (
                           <p className="italic text-muted-foreground">{t('pages.experiences.noDetails')}</p>
                         )}
                      </div>
                      
                      {experience.skills && experience.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                          {experience.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="bg-background text-xs font-normal border-border/60 hover:bg-secondary/50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFormOpen && (
        <ExperienceForm
          experience={editingExperience}
          onSave={editingExperience ? 
            (updates) => handleUpdate(editingExperience.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
}