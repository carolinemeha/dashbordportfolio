'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Experience } from '@/lib/data';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import ExperienceForm from '@/components/admin/ExperienceForm';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expériences</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos expériences professionnelles
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle expérience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune expérience</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre première expérience</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une expérience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <Card key={experience.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{experience.title}</CardTitle>
                    <CardDescription>{experience.company}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(experience)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{experience.startDate}</span>
                    <span className="mx-2">-</span>
                    <span>{experience.endDate || 'Présent'}</span>
                  </div>
                  <p className="text-gray-700">{experience.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
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
        />
      )}
    </div>
  );
}