'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { dataService, Experience } from '@/lib/data';
import { Plus, Edit, Trash2, Briefcase, CalendarDays, MapPin } from 'lucide-react';
import ExperienceForm from '@/components/admin/ExperienceForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = dataService.getExperiences();
      setExperiences(data);
    } catch (err) {
      setError("Impossible de charger les expériences");
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const validateExperience = (data: Partial<Experience>) => {
    const errors: string[] = [];
    if (!data.title) errors.push("Le titre est requis");
    if (!data.company) errors.push("L'entreprise est requise");
    if (!data.startDate) errors.push("La date de début est requise");
    
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }
  };

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: message,
      variant,
    });
  };

  const handleCreate = useCallback(async (experienceData: Omit<Experience, 'id'>) => {
    try {
      validateExperience(experienceData);
      const newExperience = dataService.createExperience(experienceData);
      setExperiences(prev => [...prev, newExperience]);
      setIsFormOpen(false);
      showToast("Expérience créée avec succès");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  }, []);

  const handleUpdate = useCallback(async (id: string, updates: Partial<Experience>) => {
    try {
      validateExperience(updates);
      dataService.updateExperience(id, updates);
      setExperiences(prev => 
        prev.map(exp => exp.id === id ? {...exp, ...updates} : exp)
      );
      setEditingExperience(null);
      setIsFormOpen(false);
      showToast("Expérience mise à jour");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      dataService.deleteExperience(id);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setDeleteDialogOpen(false);
      showToast("Expérience supprimée");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Échec de la suppression");
    }
  }, []);

  const openDeleteDialog = useCallback((id: string) => {
    setExperienceToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const openEditForm = useCallback((experience: Experience) => {
    setEditingExperience(experience);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingExperience(null);
    setError(null);
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy', { locale: fr });
  };

  const sortedExperiences = [...experiences].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (loading) {
    return (
      <section className="space-y-6" aria-label="Chargement des expériences">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-16 w-full" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4" aria-label="Erreur de chargement">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              {error.split('\n').map((line, i) => (
                <p key={i} className="text-destructive">{line}</p>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={fetchExperiences}
              aria-label="Réessayer"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="experiences-heading">
      <header className="flex justify-between items-center">
        <div>
          <h1 id="experiences-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Expériences Professionnelles
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gérez et organisez votre historique professionnel
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} aria-label="Ajouter une expérience">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une expérience
        </Button>
      </header>

      {sortedExperiences.length === 0 ? (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune expérience enregistrée
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Commencez par ajouter votre première expérience professionnelle
            </p>
            <Button onClick={() => setIsFormOpen(true)} aria-label="Ajouter une expérience">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une expérience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedExperiences.map((experience) => (
            <Card 
              key={experience.id} 
              className="hover:shadow-md transition-shadow"
              aria-label={`Expérience: ${experience.title} chez ${experience.company}`}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{experience.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {experience.company}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(experience)}
                      aria-label={`Modifier l'expérience ${experience.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(experience.id)}
                      aria-label={`Supprimer l'expérience ${experience.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>{formatDate(experience.startDate)}</span>
                  <span className="mx-2">-</span>
                  <span>{experience.endDate ? formatDate(experience.endDate) : 'Présent'}</span>
                </div>
                
                {experience.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{experience.location}</span>
                  </div>
                )}
                
                <p className="text-gray-700 dark:text-gray-300">{experience.description}</p>
                
                {experience.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2" aria-label="Compétences">
                    {experience.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ExperienceForm
          experience={editingExperience}
          onSave={editingExperience ? 
            (updates) => handleUpdate(editingExperience.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
          error={error}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette expérience ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel aria-label="Annuler la suppression">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => experienceToDelete && handleDelete(experienceToDelete)}
              className="bg-red-600 hover:bg-red-700"
              aria-label="Confirmer la suppression"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}