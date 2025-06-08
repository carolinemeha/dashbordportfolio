'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/lib/data';

interface ServiceFormProps {
  service?: Service;
  onSubmit: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    icon: '',
    features: []
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon,
        features: service.features
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="icon">Icône (nom de classe Lucide)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="ex: Settings, Code, Database"
            required
          />
        </div>

        <div>
          <Label>Fonctionnalités</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ajouter une fonctionnalité"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFeature}
              >
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {service ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
} 