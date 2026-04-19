'use client';

import { useState, useEffect } from 'react';
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
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { projectCategoryLabel } from '@/lib/admin-ui-labels';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (data: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

const emptyForm = (project?: Project | null) => ({
  title: project?.title ?? '',
  description: project?.description ?? '',
  image: project?.image ?? '',
  demo: project?.demo ?? '',
  github: project?.github ?? '',
  technologies: project?.technologies ?? [],
  category: project?.category ?? 'fullstack',
  status: project?.status ?? 'completed',
  date: project?.date ?? new Date().toISOString().split('T')[0].substring(0, 7),
  featured: project?.featured ?? false,
});

export default function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { t } = useAdminI18n();
  const [formData, setFormData] = useState(() => emptyForm(project));

  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    setFormData(emptyForm(project));
    setNewTech('');
  }, [project]);

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
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            {project ? t('forms.project.titleEdit') : t('forms.project.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {project ? t('forms.project.descEdit') : t('forms.project.descNew')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">{t('forms.project.projectTitle')} <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.project.titlePh')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> {t('forms.project.date')} <span className="text-destructive">*</span>
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
                 <LayoutGrid className="h-4 w-4 text-muted-foreground" /> {t('forms.project.category')} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder={t('forms.shared.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">{projectCategoryLabel('frontend', t)}</SelectItem>
                  <SelectItem value="fullstack">{projectCategoryLabel('fullstack', t)}</SelectItem>
                  <SelectItem value="ui-ux">{projectCategoryLabel('ui-ux', t)}</SelectItem>
                  <SelectItem value="design">{projectCategoryLabel('design', t)}</SelectItem>
                  <SelectItem value="logo">{projectCategoryLabel('logo', t)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground flex items-center gap-2">
                 <Activity className="h-4 w-4 text-muted-foreground" /> {t('forms.project.status')} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder={t('forms.shared.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">{t('forms.project.statusDone')}</SelectItem>
                  <SelectItem value="in-progress">{t('forms.project.statusProgress')}</SelectItem>
                  <SelectItem value="planned">{t('forms.project.statusPlanned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">{t('forms.project.description')} <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y min-h-[100px]"
              placeholder={t('forms.project.descPh')}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <ImageUpload
              label={t('forms.project.coverImage')}
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              path="work"
              successMessage={t('imageUpload.coverSuccess')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="demo" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" /> {t('forms.project.demoUrl')}
              </Label>
              <Input
                id="demo"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={formData.demo}
                onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://monsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="text-foreground flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" /> {t('forms.project.githubUrl')}
              </Label>
              <Input
                id="github"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://github.com/vous/repo"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <Label className="text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> {t('forms.project.stack')}
            </Label>
            <div className="flex space-x-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 flex-1"
                placeholder={t('forms.shared.enterToAdd')}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechnology(); } }}
              />
              <Button type="button" variant="secondary" onClick={addTechnology}>
                {t('forms.shared.add')}
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
                  <span className="text-sm text-muted-foreground italic flex items-center">{t('forms.project.noTech')}</span>
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
            <Label htmlFor="featured" className="text-foreground cursor-pointer font-medium">{t('forms.project.featured')}</Label>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {project ? t('forms.shared.saveChanges') : t('forms.project.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}