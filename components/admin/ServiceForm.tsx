'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Service } from '@/lib/data';
import { Settings, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ServiceFormProps {
  service?: Service | null;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    title: '',
    shortDescription: '',
    description: '',
    icon: '',
    features: []
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        shortDescription: service.shortDescription || '',
        description: service.description || '',
        icon: service.icon || '',
        features: service.features || []
      });
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
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
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            {service ? 'Modifier le service' : 'Nouveau service'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {service ? 'Mettez à jour les détails de ce service.' : 'Décrivez une nouvelle prestation pour vos clients.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Titre du service <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Développement Web"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon" className="text-foreground">Icône (Nom Lucide)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="ex: Monitor, Code, Database"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="text-foreground">Description courte <span className="text-destructive">*</span></Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
              placeholder="Un résumé rapide du service..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description détaillée <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder="Détaillez en quoi consiste ce service..."
              required
            />
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Fonctionnalités incluses
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder="Ex: Design responsive, Optimisation SEO..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <Button type="button" variant="secondary" onClick={handleAddFeature}>
                Ajouter
              </Button>
            </div>
            
            <div className="pt-2">
              {formData.features.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-2">Aucune fonctionnalité ajoutée.</p>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence>
                    {formData.features.map((feature, index) => (
                      <motion.li 
                        key={`${feature}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-2.5 bg-background border border-border/40 rounded-lg shadow-sm group"
                      >
                        <span className="flex items-center text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2 opacity-50" />
                          {feature}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {service ? 'Enregistrer les modifications' : 'Créer le service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 