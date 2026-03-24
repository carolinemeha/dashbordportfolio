'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CVInfo } from '@/lib/data';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface CVFormProps {
  cv: CVInfo | null;
  onSave: (updates: Partial<CVInfo>) => void;
  onCancel: () => void;
}

export default function CVForm({ cv, onSave, onCancel }: CVFormProps) {
  const [formData, setFormData] = useState<Partial<CVInfo>>(
    cv || {
      fileName: '',
      uploadDate: formatDate(new Date()),
      fileSize: '',
      version: 1,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fileName) {
      newErrors.fileName = 'Le nom du fichier est requis';
    } else if (formData.fileName.length > 100) {
      newErrors.fileName = 'Le nom doit faire moins de 100 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    onSave(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }

    setFormData({
      ...formData,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: formatDate(new Date()),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">
            {cv ? 'Modifier le CV' : 'Ajouter un nouveau CV'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">Nom du fichier *</Label>
              <Input
                id="fileName"
                value={formData.fileName || ''}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className={errors.fileName ? 'border-red-500' : ''}
              />
              {errors.fileName && (
                <p className="text-sm text-red-500 mt-1">{errors.fileName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="fileUpload">Uploader un nouveau fichier (PDF)</Label>
              <Input
                id="fileUpload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Taille maximale : 5MB. Format accepté : PDF
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uploadDate">Date</Label>
                <Input
                  id="uploadDate"
                  value={formData.uploadDate || ''}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="fileSize">Taille</Label>
                <Input
                  id="fileSize"
                  value={formData.fileSize || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {cv ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}