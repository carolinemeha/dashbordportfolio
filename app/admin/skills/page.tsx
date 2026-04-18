'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Skill } from '@/lib/data';
import { Plus, Edit, Trash2, Wrench, Layers } from 'lucide-react';
import SkillForm from '@/components/admin/SkillForm';
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

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    setSkills(dataService.getSkills());
  }, []);

  const handleCreate = (skillData: Omit<Skill, 'id'>) => {
    const newSkill = dataService.createSkill(skillData);
    setSkills(dataService.getSkills());
    setIsFormOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Skill>) => {
    dataService.updateSkill(id, updates);
    setSkills(dataService.getSkills());
    setEditingSkill(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      dataService.deleteSkill(id);
      setSkills(dataService.getSkills());
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

  // Grouper les compétences par catégorie
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Compétences
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez l'inventaire de votre savoir-faire technique
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle compétence
          </Button>
        </motion.div>
      </div>

      {skills.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wrench className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune compétence</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Vous n'avez pas encore renseigné vos compétences. Ajoutez-en pour montrer vos atouts.</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une compétence
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <motion.div key={category} variants={itemVariants}>
              <Card className="glass-card border-border/40 overflow-hidden">
                <CardHeader className="bg-secondary/10 border-b border-border/30 pb-3 p-5 flex flex-row items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground m-0">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {categorySkills.map((skill) => (
                        <motion.div
                          key={skill.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="group flex flex-col justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-all rounded-xl border border-border/30 relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-foreground truncate pr-2">{skill.name}</h4>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg border border-border/40 shadow-sm">
                              <Button variant="ghost" size="icon" onClick={() => openEditForm(skill)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 mt-auto">
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                              <span>Niveau</span>
                              <span>{skill.level}/5 <span className="text-primary ml-1">★</span></span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden border border-border/20">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {isFormOpen && (
        <SkillForm
          skill={editingSkill}
          onSave={editingSkill ? 
            (updates) => handleUpdate(editingSkill.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
} 