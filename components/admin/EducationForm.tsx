'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, CalendarDays, MapPin, Award } from 'lucide-react';
import { Education } from '@/lib/data';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EducationFormProps {
  education?: Education | null;
  onSave: (data: Omit<Education, 'id'>) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
}

export default function EducationForm({ education, onSave, onCancel, error }: EducationFormProps) {
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    degree: '',
    school: '',
    startDate: '',
    endDate: '',
    description: '',
    grade: '',
    location: '',
    achievements: false,
    year: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        school: education.school || '',
        startDate: education.startDate ? format(new Date(education.startDate), 'yyyy-MM-dd') : '',
        endDate: education.endDate ? format(new Date(education.endDate), 'yyyy-MM-dd') : '',
        description: education.description || '',
        grade: education.grade || '',
        location: education.location || '',
        achievements: education.achievements || false,
        year: education.year || '',
      });
    } else {
      setFormData({
        degree: '',
        school: '',
        startDate: '',
        endDate: '',
        description: '',
        grade: '',
        location: '',
        achievements: false,
        year:'',
      });
    }
    setErrors({});
  }, [education]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.degree.trim()) newErrors.degree = 'Le diplôme est requis';
    if (!formData.school.trim()) newErrors.school = "L'école est requise";
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    setFormData(prev => ({ ...prev, achievements: checked === true }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {education ? 'Modifier la formation' : 'Ajouter une formation'}
          </DialogTitle>
          <DialogDescription>
            {education ? 
              'Mettez à jour les détails de cette formation' : 
              'Renseignez les informations de votre nouvelle formation'}
          </DialogDescription>
        </DialogHeader>

        {(error || Object.keys(errors).length > 0) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 dark:bg-red-900/20 dark:border-red-800">
            {error && <p className="mb-2 font-medium">{error}</p>}
            {Object.values(errors).map((err, i) => (
              <p key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{err}</span>
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Diplôme *
              </Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="Ex: Licence en Informatique"
                className={errors.degree ? 'border-red-500' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                École *
              </Label>
              <Input
                id="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="Ex: Université Paris-Saclay"
                className={errors.school ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date de début *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'border-red-500' : ''}
                max={formData.endDate || undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'border-red-500' : ''}
                min={formData.startDate || undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lieu
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Paris, France"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Note</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="Ex: Mention Très Bien"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez votre formation, vos spécialisations, etc."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="achievements"
              checked={formData.achievements}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="achievements">
              Réalisations importantes
            </Label>
          </div>

          <DialogFooter className="pt-4 sticky bottom-0 bg-background">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : education ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}