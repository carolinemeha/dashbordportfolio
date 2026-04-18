'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skill } from '@/lib/data';
import { Wrench, Tag, Layers, Star } from 'lucide-react';

interface SkillFormProps {
  skill?: Skill | null;
  onSave: (skill: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
}

export default function SkillForm({ skill, onSave, onCancel }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'Frontend',
    level: 3,
    description: '',
    icon: ''
  });

  const categories = ['Frontend', 'Backend', 'DevOps', 'Design', 'Outils', 'Langues', 'Soft Skills'];

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        category: skill.category || 'Frontend',
        level: typeof skill.level === 'number' ? skill.level : 3,
        description: skill.description || '',
        icon: skill.icon || ''
      });
    }
  }, [skill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-xl glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            {skill ? 'Modifier la compétence' : 'Nouvelle compétence'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {skill ? 'Mettez à jour le niveau de cette compétence.' : 'Ajoutez un nouveau savoir-faire à votre profil.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nom de la compétence <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: React, Figma, Python..."
                required
              />
            </div>
            
            <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
              <Label className="text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" /> Catégorie
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge 
                    key={cat} 
                    variant={formData.category === cat ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 transition-all text-sm font-normal ${
                      formData.category === cat 
                      ? 'bg-primary text-primary-foreground border-transparent' 
                      : 'bg-background hover:bg-secondary/80 border-border/60'
                    }`}
                    onClick={() => setFormData({ ...formData, category: cat })}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="pt-2">
                <Label htmlFor="category-custom" className="text-xs text-muted-foreground block mb-1">Ou catégorie personnalisée :</Label>
                <Input
                  id="category-custom"
                  value={!categories.includes(formData.category) ? formData.category : ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 h-8 text-sm"
                  placeholder="Tapez une autre catégorie..."
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex justify-between items-center">
                <Label htmlFor="level" className="text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> Niveau de maîtrise
                </Label>
                <span className="text-lg font-bold text-primary">{formData.level}/5</span>
              </div>
              <input
                id="level"
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Débutant</span>
                <span>Intermédiaire</span>
                <span>Expert</span>
              </div>
            </div>

          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {skill ? 'Enregistrer les modifications' : 'Ajouter la compétence'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 