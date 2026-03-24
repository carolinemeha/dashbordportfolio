'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/lib/data';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FaCode, FaPalette, FaMobile, FaSearch, FaChartLine, 
  FaServer, FaDatabase, FaFire, FaLaravel 
} from 'react-icons/fa';
import { 
  SiAdobephotoshop, SiAdobexd, SiFigma, SiNextdotjs, 
  SiReact, SiNodedotjs, SiCanva, SiAdobeillustrator 
} from 'react-icons/si';

interface ServiceFormProps {
  service?: Service;  
  onSubmit: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const availableIcons = [
  { name: 'FaCode', component: FaCode, label: 'Code' },
  { name: 'FaPalette', component: FaPalette, label: 'Design' },
  { name: 'FaMobile', component: FaMobile, label: 'Mobile' },
  { name: 'FaChartLine', component: FaChartLine, label: 'Analytics' },
  { name: 'FaServer', component: FaServer, label: 'Server' },
  { name: 'SiFigma', component: SiFigma, label: 'Figma' },
  { name: 'SiNextdotjs', component: SiNextdotjs, label: 'Next.js' },
  { name: 'SiReact', component: SiReact, label: 'React' },
  { name: 'SiNodedotjs', component: SiNodedotjs, label: 'Node.js' },
  { name: 'SiAdobephotoshop', component: SiAdobephotoshop, label: 'Photoshop' },
  { name: 'SiAdobexd', component: SiAdobexd, label: 'Adobe XD' },
  { name: 'SiAdobeillustrator', component: SiAdobeillustrator, label: 'Illustrator' },
  { name: 'SiCanva', component: SiCanva, label: 'Canva' },
  { name: 'FaDatabase', component: FaDatabase, label: 'Database' },
  { name: 'FaFire', component: FaFire, label: 'Firebase' },
  { name: 'FaLaravel', component: FaLaravel, label: 'Laravel' },
];

const categories = [
  { value: 'web', label: 'Développement Web' },
  { value: 'design', label: 'Design' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'marketing', label: 'Marketing' },
];

export default function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    shortDescription: '',
    description: '',
    icon: 'FaCode',
    features: [],
    isFeatured: false,
    displayOrder: 0,
    category: 'web'
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        shortDescription: service.shortDescription || '',
        description: service.description,
        icon: service.icon || 'FaCode',
        features: service.features || [],
        isFeatured: service.isFeatured || false,
        displayOrder: service.displayOrder || 0,
        category: service.category || 'web'
      });
    }
  }, [service]);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onSubmit({
    ...formData,
    displayOrder: Number(formData.displayOrder) || 0 
  });
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
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="shortDescription">Description courte *</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
            maxLength={150}
            placeholder="Une description concise pour les cartes de service"
          />
        </div>

        <div>
          <Label htmlFor="description">Description détaillée *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
            maxLength={500}
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="icon">Icône *</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une icône" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {availableIcons.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <SelectItem key={icon.name} value={icon.name}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="displayOrder">Ordre d'affichage</Label>
            <Input
              id="displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2 pt-7">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
            />
            <Label htmlFor="isFeatured">Service en vedette</Label>
          </div>
        </div>

        <div>
          <Label>Fonctionnalités</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ajouter une fonctionnalité"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFeature}
                disabled={!newFeature.trim()}
              >
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1 text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700"
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
          {service ? 'Enregistrer les modifications' : 'Créer le service'}
        </Button>
      </div>
    </form>
  );
}