'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { dataService, Education } from '@/lib/data';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import EducationForm from '@/components/admin/EducationForm';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function EducationPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEducation = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    // Utilisez directement getEducations() sans le timeout simulé
    const data = dataService.getEducations();
    setEducation(data);
  } catch (err) {
    setError("Impossible de charger les formations");
    console.error("Erreur de chargement", err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const showToast = (message: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: message,
      variant,
    });
  };

  const handleCreate = useCallback(async (educationData: Omit<Education, 'id'>) => {
  try {
    // Utilisez la méthode addEducation du dataService
    const newEducation = dataService.addEducation(educationData);
    setEducation(prev => [...prev, newEducation]);
    setIsFormOpen(false);
    showToast("Formation créée avec succès");
  } catch (error) {
    setError(error instanceof Error ? error.message : "Une erreur est survenue");
  }
}, []);

const handleUpdate = useCallback(async (id: string, updates: Partial<Education>) => {
  try {
    // Utilisez la méthode updateEducation du dataService
    dataService.updateEducation(id, updates);
    setEducation(prev => 
      prev.map(edu => edu.id === id ? {...edu, ...updates} : edu)
    );
    setEditingEducation(null);
    setIsFormOpen(false);
    showToast("Formation mise à jour");
  } catch (error) {
    setError(error instanceof Error ? error.message : "Une erreur est survenue");
  }
}, []);

const handleDelete = useCallback(async (id: string) => {
  try {
    // Utilisez la méthode deleteEducation du dataService
    dataService.deleteEducation(id);
    setEducation(prev => prev.filter(edu => edu.id !== id));
    setDeleteDialogOpen(false);
    showToast("Formation supprimée");
  } catch (error) {
    setError(error instanceof Error ? error.message : "Échec de la suppression");
  }
}, []);

  const openDeleteDialog = useCallback((id: string) => {
    setEducationToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const openEditForm = useCallback((education: Education) => {
    setEditingEducation(education);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEducation(null);
    setError(null);
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy', { locale: fr });
  };

  // Trier les formations par date de fin (la plus récente en premier)
  const sortedEducation = [...education].sort((a, b) => {
    if (!a.endDate) return -1;
    if (!b.endDate) return 1;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        {error}
        <Button 
          variant="outline" 
          onClick={fetchEducation}
          className="mt-2"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="education-heading">
      <header className="flex justify-between items-center">
        <div>
          <h1 id="education-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Formations
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gérez vos formations et diplômes
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} aria-label="Ajouter une formation">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </header>

      {education.length === 0 ? (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune formation enregistrée
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Commencez par ajouter vos formations
            </p>
            <Button onClick={() => setIsFormOpen(true)} aria-label="Ajouter une formation">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une formation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEducation.map((edu) => (
            <Card key={edu.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{edu.degree}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {edu.school}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(edu)}
                      aria-label={`Modifier la formation ${edu.degree}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(edu.id)}
                      aria-label={`Supprimer la formation ${edu.degree}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDate(edu.startDate)}</span>
                  <span className="mx-2">-</span>
                  <span>{edu.endDate ? formatDate(edu.endDate) : 'En cours'}</span>
                </div>
                
                {edu.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {edu.location}
                  </p>
                )}
                
                {edu.description && (
                  <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>
                )}
                
                {edu.grade && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Note: {edu.grade}
                  </p>
                )}
                
                {edu.achievements && (
                  <Badge variant="secondary" className="text-sm">
                    Réalisations importantes
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <EducationForm
          education={editingEducation}
          onSave={editingEducation ? 
            (updates) => handleUpdate(editingEducation.id, updates) : 
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
              Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel aria-label="Annuler la suppression">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => educationToDelete && handleDelete(educationToDelete)}
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