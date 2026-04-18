'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Project } from '@/lib/data';
import { Plus, Edit, Trash2, ExternalLink, Github, Star, FolderOpen } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(dataService.getProjects());
  }, []);

  const handleCreate = (projectData: Omit<Project, 'id'>) => {
    const newProject = dataService.createProject(projectData);
    setProjects(dataService.getProjects());
    setIsFormOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Project>) => {
    dataService.updateProject(id, updates);
    setProjects(dataService.getProjects());
    setEditingProject(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      dataService.deleteProject(id);
      setProjects(dataService.getProjects());
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Projets portfolio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez et mettez en valeur vos réalisations
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        </motion.div>
      </div>

      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FolderOpen className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun projet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Vous n'avez pas encore ajouté de projet à votre portfolio. Commencez par créer votre premier projet.</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Créer un projet
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants} exit="exit" layout>
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
                        En vedette
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Button variant="secondary" size="sm" onClick={() => openEditForm(project)} className="border-none shadow-lg transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)} className="shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="flex-none p-5 pb-3">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
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
                    <div className="flex space-x-2 pt-2 border-t border-border/40">
                      {project.liveUrl && (
                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-primary px-2">
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Live
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground px-2">
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3.5 w-3.5 mr-1" />
                            Code
                          </a>
                        </Button>
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