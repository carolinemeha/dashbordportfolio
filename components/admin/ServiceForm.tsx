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
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { serviceFormCategoryLabel } from '@/lib/admin-ui-labels';

interface ServiceFormProps {
  service?: Service | null;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const { t } = useAdminI18n();
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
    // Si l'utilisateur saisit uniquement l'icône (ex: 'react'), on s'en sert comme nom, et inversement
    let techName = newTech.trim();
    let techIcon = newTechIcon.trim();

    if (!techName && techIcon) {
      // Déduit le nom à partir de l'icône (enlève fa/si et la première lettre majuscule)
      techName = techIcon.replace(/^(fa|si|Fa|Si)/, '');
      techName = techName.charAt(0).toUpperCase() + techName.slice(1);
    } else if (techName && !techIcon) {
      // Optionnel : on pourrait deviner l'icône, mais l'IconRenderer s'en charge déjà bien
      techIcon = techName;
    }

    if (techName && !formData.technologies?.some(t => t.name.toLowerCase() === techName.toLowerCase())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), { 
          name: techName,
          icon: techIcon || undefined
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
            {service ? t('forms.service.titleEdit') : t('forms.service.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {service ? t('forms.service.descEdit') : t('forms.service.descNew')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">{t('forms.service.serviceTitle')} <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.service.titlePh')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4 text-muted-foreground" /> {t('forms.service.category')} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder={t('forms.shared.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">{serviceFormCategoryLabel('web', t)}</SelectItem>
                  <SelectItem value="design">{serviceFormCategoryLabel('design', t)}</SelectItem>
                  <SelectItem value="mobile">{serviceFormCategoryLabel('mobile', t)}</SelectItem>
                  <SelectItem value="marketing">{serviceFormCategoryLabel('marketing', t)}</SelectItem>
                   <SelectItem value="web & mobile">{serviceFormCategoryLabel('web & mobile', t)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="iconName" className="text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground"/> {t('forms.service.iconName')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                  placeholder={t('forms.service.iconPh')}
                />
                <div className="w-10 h-10 bg-secondary/30 border border-border/50 rounded flex items-center justify-center text-primary">
                  <IconRenderer iconName={formData.iconName} className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{t('forms.service.iconExamples')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">{t('forms.service.description')} <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder={t('forms.service.descPh')}
              required
            />
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> {t('forms.service.pricingOptional')}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="price-basic" className="text-xs text-muted-foreground uppercase tracking-wider">{t('pages.services.tierBasic')}</Label>
                <Input
                  id="price-basic"
                  value={formData.pricing?.basic}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, basic: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder={t('forms.service.pricePhBasic')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-standard" className="text-xs text-muted-foreground uppercase tracking-wider">{t('pages.services.tierStandard')}</Label>
                <Input
                  id="price-standard"
                  value={formData.pricing?.standard}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, standard: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder={t('forms.service.pricePhStandard')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-premium" className="text-xs text-muted-foreground uppercase tracking-wider">{t('pages.services.tierPremium')}</Label>
                <Input
                  id="price-premium"
                  value={formData.pricing?.premium}
                  onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, premium: e.target.value } })}
                  className="bg-secondary/30 border-border/50 h-8 text-sm"
                  placeholder={t('forms.service.pricePhPremium')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Label className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> {t('forms.service.features')}
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder={t('forms.service.featurePh')}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <Button type="button" variant="secondary" onClick={handleAddFeature}>
                {t('forms.shared.add')}
              </Button>
            </div>
            
            <div className="pt-2">
              {formData.features.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-2">{t('forms.service.noFeatures')}</p>
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
              <Cpu className="h-4 w-4 text-muted-foreground" /> {t('forms.service.technologies')}
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="bg-background border-border/50 focus-visible:ring-primary/50 flex-1"
                  placeholder={t('forms.service.techNamePh')}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                />
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newTechIcon}
                    onChange={(e) => setNewTechIcon(e.target.value)}
                    className="bg-background border-border/50 focus-visible:ring-primary/50 flex-1"
                    placeholder={t('forms.service.techIconPh')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                  />
                  <div className="w-10 h-10 bg-secondary/30 border border-border/50 rounded flex items-center justify-center text-primary shrink-0">
                    <IconRenderer iconName={newTechIcon} className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={addTech} className="shrink-0">
                {t('forms.shared.add')}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic px-1">{t('forms.service.iconHint')}</p>
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
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {service ? t('forms.shared.saveChanges') : t('forms.service.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 