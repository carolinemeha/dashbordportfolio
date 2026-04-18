'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Experience } from '@/lib/data';
import { Briefcase, Building, MapPin, Calendar } from 'lucide-react';

interface ExperienceFormProps {
  experience?: Experience | null;
  onSave: (data: Omit<Experience, 'id'>) => void;
  onCancel: () => void;
}

export default function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company: experience?.company || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    current: !experience?.endDate && !!experience?.startDate, // Basic logic for current
    description: experience?.description || '',
    location: experience?.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            {experience ? 'Modifier l\'expérience' : 'Nouvelle expérience'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {experience ? 'Mettez à jour les détails de ce poste.' : 'Renseignez un nouveau rôle dans votre parcours professionnel.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Poste <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Développeur Full Stack"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" /> Entreprise <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Nom de l'entreprise"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Lieu
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              placeholder="Paris, France"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={formData.current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Switch
              id="current"
              checked={formData.current}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                current: checked,
                endDate: checked ? '' : formData.endDate
              })}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="current" className="text-foreground cursor-pointer font-medium">J'occupe actuellement ce poste</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder="Décrivez vos responsabilités et réalisations..."
              required
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {experience ? 'Enregistrer les modifications' : 'Ajouter l\'expérience'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}