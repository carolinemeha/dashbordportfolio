'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, Education } from '@/lib/data';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import EducationForm from '../../../components/admin/EducationForm';

export default function EducationPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  useEffect(() => {
    setEducation(dataService.getEducation());
  }, []);

  const handleCreate = (educationData: Omit<Education, 'id'>) => {
    const newEducation = dataService.createEducation(educationData);
    setEducation(dataService.getEducation());
    setIsFormOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Education>) => {
    dataService.updateEducation(id, updates);
    setEducation(dataService.getEducation());
    setEditingEducation(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      dataService.deleteEducation(id);
      setEducation(dataService.getEducation());
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

  // Trier les formations par date de fin (la plus récente en premier)
  const sortedEducation = [...education].sort((a, b) => {
    if (!a.endDate) return -1;
    if (!b.endDate) return 1;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Éducation</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos formations et diplômes
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>

      {education.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter vos formations</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une formation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedEducation.map((edu) => (
            <Card key={edu.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{edu.degree}</CardTitle>
                    <CardDescription>{edu.school}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(edu)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(edu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{edu.startDate}</span>
                    <span className="mx-2">-</span>
                    <span>{edu.endDate || 'En cours'}</span>
                  </div>
                  <p className="text-gray-700">{edu.description}</p>
                  {edu.location && (
                    <p className="text-sm text-gray-500">{edu.location}</p>
                  )}
                </div>
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
        />
      )}
    </div>
  );
} 