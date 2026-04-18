'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/lib/data';
import { X, FolderOpen, Link as LinkIcon, Github, Calendar, Tag, Activity, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './ImageUpload';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (data: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    image: project?.image || '',
    demo: project?.demo || '',
    github: project?.github || '',
    technologies: project?.technologies || [],
    category: project?.category || 'fullstack',
    status: project?.status || 'completed',
    date: project?.date || new Date().toISOString().split('T')[0].substring(0, 7), // YYYY-MM
    featured: project?.featured || false,
  });

  const [newTech, setNewTech] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {project ? 'Modifiez les informations de ce projet pour les tenir à jour.' : 'Détaillez votre réalisation pour l\'ajouter à votre vitrine.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Titre du projet <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="Ex: Refonte E-commerce"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date (ex: YYYY-MM) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="month"
                value={formData.date}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4 text-muted-foreground" /> Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="fullstack">Fullstack</SelectItem>
                  <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                  <SelectItem value="design">Design Graphique</SelectItem>
                  <SelectItem value="logo">Logo / Branding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground flex items-center gap-2">
                 <Activity className="h-4 w-4 text-muted-foreground" /> Statut <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder="Décrivez les objectifs, défis et résultats du projet..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <ImageUpload
              label="Image de couverture"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              path="work"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="demo" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" /> URL du site (Démo)
              </Label>
              <Input
                id="demo"
                type="url"
                value={formData.demo}
                onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://monsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="text-foreground flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" /> URL Git/Source
              </Label>
              <Input
                id="github"
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://github.com/vous/repo"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> Stack & Technologies
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder="Appuyez sur Entrée pour ajouter..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              />
              <Button type="button" variant="secondary" onClick={addTechnology}>
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[32px]">
              <AnimatePresence>
                {formData.technologies.map((tech) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge variant="default" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                      {tech}
                      <X
                        className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => removeTechnology(tech)}
                      />
                    </Badge>
                  </motion.div>
                ))}
                {formData.technologies.length === 0 && (
                  <span className="text-sm text-muted-foreground italic flex items-center">Aucune technologie ajoutée.</span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="featured" className="text-foreground cursor-pointer font-medium">Mettre en vedette (Affiché en priorité)</Label>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {project ? 'Enregistrer les modifications' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}