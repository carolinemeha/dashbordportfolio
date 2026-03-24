'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Project } from '@/lib/data';
import { Plus, Edit, Trash2, ExternalLink, Github, Star, FolderOpen } from 'lucide-react';
import ProjectForm from '@/components/admin/ProjectForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await dataService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

  const handleCreate = async (data: Omit<Project, 'id'> & { imageFile?: File }) => {
  try {
    // Si imageFile existe, uploader l'image d'abord
    let imageUrl = data.image;
    if (data.imageFile) {
      // Ici vous devez implémenter votre logique d'upload
      // Par exemple avec une API ou un service de stockage
      // imageUrl = await uploadImage(data.imageFile);
    }
    
    const projectData = { ...data, image: imageUrl };
    const newProject = dataService.createProject(projectData);
    setProjects(dataService.getProjects());
    setIsFormOpen(false);
  } catch (error) {
    console.error("Failed to create project:", error);
  }
};

  const handleUpdate = async (id: string, updates: Partial<Project>) => {
    try {
      await dataService.updateProject(id, updates);
      setProjects(await dataService.getProjects());
      setEditingProject(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      await dataService.deleteProject(projectToDelete.id);
      setProjects(await dataService.getProjects());
      setProjectToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projets</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gérez vos projets portfolio
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun projet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez par créer votre premier projet</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Project+Image';
                  }}
                />
                {project.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {project.status !== 'published' && (
                  <Badge
                    variant={project.status === 'draft' ? 'secondary' : 'outline'}
                    className="absolute top-2 left-2"
                  >
                    {project.status === 'draft' ? 'Brouillon' : 'Archivé'}
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{project.title}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProjectToDelete(project)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4"  />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="line-clamp-2 h-[40px]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Live
                        </a>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProjectForm
          project={editingProject}
          onSave={(data) => {
            if (editingProject) {
              return handleUpdate(editingProject.id, data);
            } else {
              return handleCreate(data);
            }
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProject(null);
          }}
        />
      )}

      <AlertDialog 
        open={!!projectToDelete} 
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.title}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}