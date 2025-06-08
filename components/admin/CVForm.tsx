'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CVInfo } from '@/lib/data';

interface CVFormProps {
  cv: CVInfo | null;
  onSave: (updates: Partial<CVInfo>) => void;
  onCancel: () => void;
}

export default function CVForm({ cv, onSave, onCancel }: CVFormProps) {
  const [formData, setFormData] = useState<Partial<CVInfo>>(
    cv || {
      fileName: '',
      uploadDate: '',
      fileSize: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fileName">Nom du fichier</Label>
          <Input
            id="fileName"
            value={formData.fileName}
            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}