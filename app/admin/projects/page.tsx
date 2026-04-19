'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Project } from '@/lib/data';
import { Plus, Edit, Trash2, ExternalLink, Github, Star, FolderOpen, Clock, Activity, Lightbulb, Check } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { adminStaggerContainer, adminStaggerItemExit } from '@/lib/admin-motion';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { projectCategoryLabel } from '@/lib/admin-ui-labels';

function ProjectStatusBadge({
  status,
  t,
}: {
  status: string;
  t: (key: string) => string;
}) {
  if (status === 'completed') {
    return (
      <div className="text-xs flex items-center text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 whitespace-nowrap">
        <Check className="w-3 h-3 mr-1" aria-hidden />
        {t('pages.projects.statusCompleted')}
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <div className="text-xs flex items-center text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap">
        <Activity className="w-3 h-3 mr-1 animate-pulse" aria-hidden />
        {t('pages.projects.statusInProgress')}
      </div>
    );
  }
  return (
    <div className="text-xs flex items-center text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800 whitespace-nowrap">
      <Lightbulb className="w-3 h-3 mr-1" aria-hidden />
      {t('pages.projects.statusPlanned')}
    </div>
  );
}

export default function ProjectsPage() {
  const { t } = useAdminI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getProjects();
      setProjects(data || []);
    };
    fetchData();
  }, []);

  const handleCreate = async (projectData: Omit<Project, 'id'>) => {
    const newProject = await dataService.createProject(projectData);
    if (newProject) {
      const refreshedData = await dataService.getProjects();
      setProjects(refreshedData);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    const updatedProject = await dataService.updateProject(id, updates);
    if (updatedProject) {
      const refreshedData = await dataService.getProjects();
      setProjects(refreshedData);
      setEditingProject(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.deleteProject'))) {
      const success = await dataService.deleteProject(id);
      if (success) {
        const refreshedData = await dataService.getProjects();
        setProjects(refreshedData);
      }
    }
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-8">
      <AdminPageToolbar>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-xl shadow-md hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('pages.projects.new')}
        </Button>
      </AdminPageToolbar>

      {projects.length === 0 ? (
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FolderOpen className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('pages.projects.emptyTitle')}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{t('pages.projects.emptyDesc')}</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('pages.projects.createFirst')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={adminStaggerContainer}
          initial={false}
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div key={project.id} variants={adminStaggerItemExit} exit="exit" layout>
                <Card className="glass-card overflow-hidden group border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-secondary/50">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FolderOpen className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    {project.featured && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 border-none shadow-md">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {t('pages.projects.featured')}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="absolute top-3 left-3 bg-background/80 backdrop-blur-md shadow-sm border-none uppercase text-[10px] tracking-wider">
                      {projectCategoryLabel(project.category, t)}
                    </Badge>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Button variant="secondary" size="sm" onClick={() => openEditForm(project)} className="border-none shadow-lg transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)} className="shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="flex-none p-5 pb-3">
                    <div className="flex justify-between items-start gap-2">
                       <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                       <ProjectStatusBadge status={project.status} t={t} />
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 p-5 pt-0">
                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs font-normal bg-secondary/50">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-border/40">
                      <div className="flex space-x-2">
                        {project.demo && (
                          <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-primary px-2">
                            <a href={project.demo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              {t('pages.projects.demo')}
                            </a>
                          </Button>
                        )}
                        {project.github && (
                          <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground px-2">
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <Github className="h-3.5 w-3.5 mr-1" />
                              {t('pages.projects.code')}
                            </a>
                          </Button>
                        )}
                      </div>
                      {project.date && (
                         <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {project.date}
                         </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFormOpen && (
        <ProjectForm
          project={editingProject}
          onSave={editingProject ? 
            (updates) => handleUpdate(editingProject.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
}