'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Experience } from '@/lib/data';
import { Plus, Edit, Trash2, Briefcase, Calendar } from 'lucide-react';
import ExperienceForm from '@/components/admin/ExperienceForm';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    setExperiences(dataService.getExperiences());
  }, []);

  const handleCreate = (experienceData: Omit<Experience, 'id'>) => {
    const newExperience = dataService.createExperience(experienceData);
    setExperiences(dataService.getExperiences());
    setIsFormOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Experience>) => {
    dataService.updateExperience(id, updates);
    setExperiences(dataService.getExperiences());
    setEditingExperience(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      dataService.deleteExperience(id);
      setExperiences(dataService.getExperiences());
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Expériences
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez la chronologie de votre parcours professionnel
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle expérience
          </Button>
        </motion.div>
      </div>

      {experiences.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Briefcase className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune expérience</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Commencez par ajouter votre première expérience professionnelle pour construire votre timeline.</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une expérience
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent"
        >
          <AnimatePresence>
            {experiences.map((experience) => (
              <motion.div key={experience.id} variants={itemVariants} exit="exit" layout className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
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
                          <CardTitle className="text-lg text-foreground">{experience.title}</CardTitle>
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
                        <span>{experience.startDate}</span>
                        <span className="mx-2 opacity-50">-</span>
                        <span className={!experience.endDate ? 'text-primary font-semibold' : ''}>{experience.endDate || 'Présent'}</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed text-pretty">{experience.description}</p>
                      
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