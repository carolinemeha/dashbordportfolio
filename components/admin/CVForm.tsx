'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVInfo } from '@/lib/data';
import { FileText, Link as LinkIcon, HardDrive, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF uniquement.');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cv_${Date.now()}.${fileExt}`;
      const filePath = `cv/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        url: publicUrl,
        uploadDate: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      });

      toast.success('CV mis en ligne avec succès !');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de la mise en ligne : " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
            <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label className="text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Mettre en ligne depuis l'appareil
              </Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 hover:bg-primary/5 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                    <p className="text-sm font-medium">Mise en ligne en cours...</p>
                  </div>
                ) : formData.url?.includes('storage.googleapis.com') || formData.url?.includes('supabase.co') ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-600">CV chargé dans le Cloud</p>
                    <p className="text-xs text-muted-foreground mt-1">Cliquer pour changer de fichier</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-medium">Cliquez ou glissez votre CV ici</p>
                    <p className="text-xs text-muted-foreground mt-1">Format PDF uniquement (Max 10Mo)</p>
                  </div>
                )}
              </div>
            </div>

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