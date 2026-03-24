'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Building2, MapPin, Code } from 'lucide-react';
import { Experience } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const programmingLanguages = [
  "JavaScript",
  "TypeScript",
  "ReactJs",
  "NextJS",
  "NodeJS",
  "React Native",
  "Firebase",
  "Postgresql",
  "Tailwind.css",
  "Laravel",
  "Bootstrap",
  "HTML",
  "CSS",
  "Bootstrap",
  "Figma",
  "Illustrator",
  "Adobe Photoshop",
  "Adobe XD",
  "Canva",
  "GitHub",
  "Python",
  "Java",
  "Stripe",
  "C#",
  "C++",
  "PHP",
  "Ruby",
  "Go",
  "Swift",
  "Kotlin",
  "Rust",
  "Dart",
  "Elixir",
  "Scala"
];

interface ExperienceFormProps {
  experience?: Experience | null;
  onSave: (data: Omit<Experience, 'id'>) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
}

export default function ExperienceForm({ experience, onSave, onCancel, error }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: '', // Changé de position à title
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    location: '',
    skills: [] as string[] // Changé de languages à skills
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openSkillsPopover, setOpenSkillsPopover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '', // Mappé correctement
        company: experience.company || '',
        startDate: experience.startDate ? format(new Date(experience.startDate), 'yyyy-MM-dd') : '',
        endDate: experience.current ? '' : (experience.endDate ? format(new Date(experience.endDate), 'yyyy-MM-dd') : ''),
        current: experience.current || false,
        description: experience.description || '',
        location: experience.location || '',
        skills: experience.skills || [] // Mappé correctement
      });
    }
  }, [experience]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.company.trim()) newErrors.company = "L'entreprise est requise";
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    
    if (!formData.current && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSave = {
        title: formData.title,
        company: formData.company,
        startDate: formData.startDate,
        endDate: formData.current ? '' : formData.endDate,
        current: formData.current,
        description: formData.description,
        location: formData.location,
        skills: formData.skills
      };

      await onSave(dataToSave);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSkillSelect = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {experience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
          </DialogTitle>
          <DialogDescription>
            {experience ? 
              'Mettez à jour les détails de cette expérience professionnelle' : 
              'Renseignez les informations de votre nouvelle expérience professionnelle'}
          </DialogDescription>
        </DialogHeader>

        {(error || Object.keys(errors).length > 0) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 dark:bg-red-900/20 dark:border-red-800">
            {error && <p className="mb-2 font-medium">{error}</p>}
            {Object.values(errors).map((err, i) => (
              <p key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{err}</span>
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Titre *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Développeur Frontend"
                className={errors.title ? 'border-red-500' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Entreprise *
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Ex: Google"
                className={errors.company ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lieu
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Paris, France (télétravail)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date de début *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'border-red-500' : ''}
                max={formData.endDate || undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.current}
                className={errors.endDate ? 'border-red-500' : ''}
                min={formData.startDate || undefined}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="current"
                  checked={formData.current}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      current: checked,
                      endDate: checked ? '' : formData.endDate
                    });
                    if (errors.endDate) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.endDate;
                        return newErrors;
                      });
                    }
                  }}
                />
                <Label htmlFor="current">Je travaille toujours ici</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Compétences
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map(skill => (
                <Badge 
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-xs hover:text-red-500"
                    aria-label={`Supprimer ${skill}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Popover open={openSkillsPopover} onOpenChange={setOpenSkillsPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSkillsPopover}
                  className="w-full justify-between"
                  type="button"
                >
                  Sélectionner des compétences...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une compétence..." />
                  <CommandEmpty>Aucune compétence trouvée</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {programmingLanguages.map((skill) => (
                      <CommandItem
                        key={skill}
                        onSelect={() => handleSkillSelect(skill)}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "mr-2 h-4 w-4",
                          formData.skills.includes(skill) ? "opacity-100" : "opacity-0"
                        )}>
                          ✓
                        </div>
                        {skill}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Décrivez vos responsabilités, réalisations et technologies utilisées..."
              className={errors.description ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Utilisez des puces (•) pour structurer votre description
            </p>
          </div>

          <DialogFooter className="pt-4 sticky bottom-0 bg-background">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : experience ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}