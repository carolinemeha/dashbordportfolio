'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Testimonial } from '@/lib/data';
import { MessageSquare, User, Briefcase, Star, ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface TestimonialFormProps {
  testimonial: Testimonial | null;
  onSave: (data: Omit<Testimonial, 'id'>) => void;
  onCancel: () => void;
}

export default function TestimonialForm({ testimonial, onSave, onCancel }: TestimonialFormProps) {
  const [formData, setFormData] = useState<Omit<Testimonial, 'id'>>({
    name: '',
    role: '',
    content: '',
    rating: 5,
    avatar: '',
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        rating: testimonial.rating ?? 5,
        avatar: testimonial.avatar,
      });
    }
  }, [testimonial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl glass-card border-border/50 max-h-[90vh] overflow-y-auto text-foreground">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            {testimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Saisissez les informations du témoignage client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ex: Caroline Meha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> Rôle / Entreprise <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ex: CEO, Entreprise X"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Avatar du client"
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                path="testimonials"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground">Contenu du témoignage <span className="text-destructive">*</span></Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y"
                placeholder="Que disent-ils de vous ?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-foreground flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" /> Note (Optionnel)
              </Label>
              <div className="flex gap-2 items-center bg-secondary/30 border border-border/50 p-2 rounded-md w-fit">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     onClick={() => setFormData({ ...formData, rating: star })}
                     className="focus:outline-none transition-transform hover:scale-110"
                   >
                     <Star 
                        className={`h-7 w-7 ${star <= (formData.rating || 0) ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-muted-foreground/30'}`} 
                     />
                   </button>
                 ))}
                 <span className="ml-3 font-semibold text-lg w-4 text-center">{formData.rating}</span>
              </div>
            </div>

          </div>
          
          <div className="pt-6 border-t border-border/40 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {testimonial ? 'Enregistrer les modifications' : 'Ajouter le témoignage'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}