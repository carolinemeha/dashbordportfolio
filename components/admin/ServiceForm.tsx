'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Service } from '@/lib/data';
import { Settings, CheckCircle2, X, DollarSign, LayoutGrid, Tag, Cpu, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import IconRenderer from './IconRenderer';

interface ServiceFormProps {
  service?: Service | null;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    iconName: '',
    category: 'web',
    features: [],
    technologies: [],
    pricing: {
      basic: '',
      standard: '',
      premium: ''
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newTechIcon, setNewTechIcon] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        iconName: service.iconName || '',
        category: service.category || 'web',
        features: service.features || [],
        technologies: service.technologies || [],
        pricing: {
          basic: service.pricing?.basic || '',
          standard: service.pricing?.standard || '',
          premium: service.pricing?.premium || ''
        }
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

  const addTech = () => {
    if (newTech.trim() && !formData.technologies?.some(t => t.name === newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), { 
          name: newTech.trim(),
          icon: newTechIcon.trim() || undefined
        }]
      });
      setNewTech('');
      setNewTechIcon('');
    }
  };

  const removeTech = (techName: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter(t => t.name !== techName)
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
              <Label htmlFor="category" className="text-foreground flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4 text-muted-foreground" /> Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Développement Web</SelectItem>
                  <SelectItem value="design">Design & Créativité</SelectItem>
                  <SelectItem value="mobile">Solutions Mobiles</SelectItem>
                  <SelectItem value="marketing">Marketing & SEO</SelectItem>
                   <SelectItem value="web & mobile">Développement Web & Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="iconName" className="text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground"/> Nom de l'icône (React Icon)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                  placeholder="ex: FaCode, SiFigma, FaMobile"
                />
                <div className="w-10 h-10 bg-secondary/30 border border-border/50 rounded flex items-center justify-center text-primary">
                  <IconRenderer iconName={formData.iconName} className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Exemples : FaCode, FaMobile, SiFigma, FaChartLine, FaServer</p>
            </div>
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
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Tarification (Optionnel)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="price-basic" className="text-xs text-muted-foreground uppercase tracking-wider">Basic</Label>
                <Input
                  id="price-basic"
                  value={formData.pricing?.basic}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, basic: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder="ex: À partir de 1500€"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-standard" className="text-xs text-muted-foreground uppercase tracking-wider">Standard</Label>
                <Input
                  id="price-standard"
                  value={formData.pricing?.standard}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, standard: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder="ex: À partir de 3000€"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-premium" className="text-xs text-muted-foreground uppercase tracking-wider">Premium</Label>
                <Input
                  id="price-premium"
                  value={formData.pricing?.premium}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, premium: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder="ex: Sur devis"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
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

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" /> Technologies utilisées
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="bg-background border-border/50 focus-visible:ring-primary/50 flex-1"
                  placeholder="Nom (ex: React)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                />
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newTechIcon}
                    onChange={(e) => setNewTechIcon(e.target.value)}
                    className="bg-background border-border/50 focus-visible:ring-primary/50 flex-1"
                    placeholder="Icône (ex: SiReact)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  />
                  <div className="w-10 h-10 bg-secondary/30 border border-border/50 rounded flex items-center justify-center text-primary shrink-0">
                    <IconRenderer iconName={newTechIcon} className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={addTech} className="shrink-0">
                Ajouter
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1">Les icônes commencent souvent par 'Si' (SimpleIcons) ou 'Fa' (FontAwesome). Ex: SiNextdotjs, SiTailwindcss, FaNodeJs</p>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
              <AnimatePresence>
                {formData.technologies?.map((tech) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 border-primary/30 text-primary bg-primary/5">
                      {tech.icon && <IconRenderer iconName={tech.icon} className="h-3 w-3" />}
                      <span className="text-xs">{tech.name}</span>
                      <X
                        className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity ml-1"
                        onClick={() => removeTech(tech.name)}
                      />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
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