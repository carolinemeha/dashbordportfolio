'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Education } from '@/lib/data';
import { GraduationCap, MapPin, Calendar, Building, Award } from 'lucide-react';

interface EducationFormProps {
  education: Education | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const [formData, setFormData] = useState({
    degree: '',
    school: '',
    year: '',
    description: '',
    grade: '',
    startDate: '',
    endDate: '',
    location: '',
  });

  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        school: education.school || '',
        year: education.year || '',
        description: education.description || '',
        grade: education.grade || '',
        startDate: education.startDate || '',
        endDate: education.endDate || '',
        location: education.location || '',
      });
    }
  }, [education]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            {education ? 'Modifier la formation' : 'Nouvelle formation'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {education ? 'Mettez à jour les détails de ce diplôme ou certification.' : 'Ajoutez un nouveau diplôme ou une formation à votre parcours académique.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="degree" className="text-foreground">Diplôme / Formation <span className="text-destructive">*</span></Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Master en Informatique"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school" className="text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" /> École / Établissement <span className="text-destructive">*</span>
              </Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Université de Paris"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Lieu
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Paris, France"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" /> Mention / Note (Optionnel)
              </Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Mention Très Bien, 18/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date de début <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground">Laissez vide si en cours</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year" className="text-foreground">Année validée (Affichage) <span className="text-destructive">*</span></Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: 2021"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder="Décrivez ce que vous avez étudié, les projets réalisés..."
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {education ? 'Enregistrer les modifications' : 'Ajouter la formation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}