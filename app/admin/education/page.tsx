'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Education } from '@/lib/data';
import { Plus, Edit, Trash2, GraduationCap, Calendar, MapPin, Building } from 'lucide-react';
import EducationForm from '../../../components/admin/EducationForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItemExit } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

export default function EducationPage() {
  const { t } = useAdminI18n();
  const [education, setEducation] = useState<Education[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getEducation();
      setEducation(data);
    };
    fetchData();
  }, []);

  const handleCreate = async (educationItem: Omit<Education, 'id'>) => {
    const newItem = await dataService.createEducation(educationItem);
    if (newItem) {
      setEducation([newItem, ...education]);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (educationItem: Omit<Education, 'id'>) => {
    if (editingEducation) {
      const updated = await dataService.updateEducation(editingEducation.id, educationItem);
      if (updated) {
        setEducation(education.map(e => e.id === editingEducation.id ? updated : e));
      }
      setEditingEducation(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteEducation'))) {
      const success = await dataService.deleteEducation(id);
      if (success) {
        setEducation(education.filter(e => e.id !== id));
      }
    }
  };

  const openEditForm = (education: Education) => {
    setEditingEducation(education);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEducation(null);
  };

  // Les formations sont déjà dans le bon ordre dans le mock
  const sortedEducation = [...education].reverse();

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl shadow-md hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.education.new')}
        </Button>
      </AdminPageToolbar>

      {education.length === 0 ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <GraduationCap className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.education.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.education.emptyDesc')}</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.education.add')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
          className="space-y-6"
        >
          <AnimatePresence>
            {sortedEducation.map((edu) => (
              <motion.div key={edu.id} variants={adminStaggerItemExit} exit="exit" layout>
                <Card className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative text-foreground">
                  <CardHeader className="pb-3 bg-secondary/10 border-b border-border/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{edu.degree}</CardTitle>
                          <CardDescription className="font-medium text-primary/80 mt-1 flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            {edu.institution}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border/50 rounded-lg p-0.5 shadow-sm absolute right-4 top-4 z-20 md:relative md:right-0 md:top-0 h-fit">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(edu)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center text-sm font-medium text-muted-foreground bg-secondary/40 w-fit px-3 py-1.5 rounded-full border border-border/30">
                      <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                      <span>{edu.duration}</span>
                    </div>
                    
                    {edu.courses && edu.courses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pages.education.coursesHeading')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {edu.courses.map((course, idx) => (
                            <Badge key={idx} variant="outline" className="bg-background/50 text-xs font-normal border-border/40">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFormOpen && (
        <EducationForm
          education={editingEducation}
          onSave={editingEducation ? (updates) => handleUpdate(updates) : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
} 