'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Certification } from '@/lib/data';
import { Award, Calendar, Building, LinkIcon } from 'lucide-react';

interface CertificationFormProps {
  certification: Certification | null;
  onSave: (certification: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
}

export default function CertificationForm({ certification, onSave, onCancel }: CertificationFormProps) {
  const [formData, setFormData] = useState<Omit<Certification, 'id'>>(
    certification || {
      title: '',
      issuer: '',
      date: '',
      credential: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px] glass-card border-border/50 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            {certification ? 'Modifier la certification' : 'Ajouter une certification'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Renseignez les détails de votre certification ou diplôme professionnel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Titre de la certification <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              placeholder="Ex: Certification UX/UI Avancé"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer" className="text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" /> Organisme émetteur <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issuer"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              placeholder="Ex: Figma, Google, OpenClassrooms"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date d'obtention <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: 2023"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credential" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" /> ID/Lien (Optionnel)
              </Label>
              <Input
                id="credential"
                value={formData.credential || ''}
                onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: VF-123456"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {certification ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
