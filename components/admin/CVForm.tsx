'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVInfo } from '@/lib/data';
import { FileText, Link as LinkIcon, HardDrive } from 'lucide-react';

interface CVFormProps {
  cv: CVInfo | null;
  onSave: (updates: Partial<CVInfo>) => void;
  onCancel: () => void;
}

export default function CVForm({ cv, onSave, onCancel }: CVFormProps) {
  const [formData, setFormData] = useState<Partial<CVInfo>>(
    cv || {
      fileName: '',
      uploadDate: new Date().toLocaleDateString('fr-FR'),
      fileSize: '1.2 MB', // Mock size
      url: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      uploadDate: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-xl glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {cv ? 'Mettre à jour le CV' : 'Ajouter un CV'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configurez les détails du CV à télécharger sur votre portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fileName" className="text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Nom du fichier affiché <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fileName"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: CV_Developpeur_Web_2024.pdf"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                URL du fichier / Lien de téléchargement
              </Label>
              <Input
                id="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">Lien Google Drive, Dropbox ou URL directe du fichier PDF.</p>
            </div>

            <div className="space-y-2">
               <Label htmlFor="fileSize" className="text-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                Taille du fichier (Texte)
              </Label>
              <Input
                id="fileSize"
                value={formData.fileSize || ''}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: 2.4 MB"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}