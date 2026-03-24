'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skill, SkillCategory } from '@/lib/data';
import { Edit, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { categories, levels } from '../../skillConfig';
import * as LucideIcons from 'lucide-react';

interface SkillFormProps {
  skill?: Skill | null;
  onSave: (skill: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
  defaultCategory?: SkillCategory;
  
}

// Type pour les icônes Lucide
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export default function SkillForm({ skill, onSave, onCancel, defaultCategory }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    name: skill?.name || '',
    category: skill?.category || defaultCategory || 'Frontend',
    level: skill?.level || 3, // Valeur numérique par défaut
    description: skill?.description || '',
    icon: skill?.icon || ''
  });

  const [IconComponent, setIconComponent] = useState<LucideIcon | null>(null);

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        description: skill.description,
        icon: skill.icon
      });
      updateIconComponent(skill.icon);
    } else {
      setFormData({
        name: '',
        category: defaultCategory || 'Frontend',
        level: 3, // Valeur numérique par défaut
        description: '',
        icon: ''
      });
      setIconComponent(null);
    }
  }, [skill, defaultCategory]);

  const updateIconComponent = (iconName: string) => {
    if (!iconName) {
      setIconComponent(null);
      return;
    }

    // Vérification de type explicite
    const iconKey = iconName as keyof typeof LucideIcons;
    const icon = LucideIcons[iconKey] as LucideIcon | undefined;

    if (icon) {
      setIconComponent(() => icon);
    } else {
      console.warn(`Icon ${iconName} not found`);
      setIconComponent(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.level === undefined) {
      console.error('Tous les champs obligatoires doivent être remplis');
      return;
    }
    onSave(formData);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, icon: value });
    updateIconComponent(value);
  };

  // Convertit le niveau numérique en chaîne pour le Select
  const getLevelString = (level: number): string => {
    if (level <= 1) return 'beginner';
    if (level <= 2) return 'intermediate';
    if (level <= 3) return 'advanced';
    return 'expert';
  };

  // Convertit la chaîne de niveau en numérique
  const getLevelNumber = (level: string): number => {
    switch (level) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      case 'expert': return 4;
      default: return 3;
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {skill ? (
              <>
                <Edit className="h-5 w-5 text-primary" />
                <span>Modifier la compétence</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                <span>Nouvelle compétence</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la compétence *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: React, Gestion de projet"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as SkillCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {cat.icon && <cat.icon className="h-4 w-4" />}
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Niveau *</Label>
                <Select
                  value={getLevelString(formData.level)}
                  onValueChange={(value) => setFormData({ ...formData, level: getLevelNumber(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl.value} value={lvl.value}>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getLevelBadgeClass(lvl.value)}
                          >
                            {getLevelValue(lvl.value)}/5
                          </Badge>
                          {lvl.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez cette compétence (optionnel)"
                />
              </div>

              <div>
                <Label htmlFor="icon">
                  Icône (nom de classe Lucide)
                  {IconComponent && (
                    <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-md bg-gray-100">
                      <IconComponent className="h-4 w-4" />
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={handleIconChange}
                    placeholder="Ex: Code, Database, Server"
                  />
                  {formData.icon && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setFormData({ ...formData, icon: '' });
                        setIconComponent(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Consultez la liste des icônes disponibles sur{' '}
                  <a
                    href="https://lucide.dev/icons/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    lucide.dev
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {skill ? 'Enregistrer les modifications' : 'Ajouter la compétence'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Fonctions utilitaires
function getLevelValue(level: string): number {
  switch (level) {
    case 'beginner': return 1;
    case 'intermediate': return 3;
    case 'advanced': return 4;
    case 'expert': return 5;
    default: return 0;
  }
}

function getLevelBadgeClass(level: string): string {
  switch (level) {
    case 'beginner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'advanced': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return '';
  }
}