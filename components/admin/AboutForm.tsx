'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AboutInfo } from '@/lib/data';
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, AtSign, Info, ImageIcon } from 'lucide-react';

interface AboutFormProps {
  about: AboutInfo | null;
  onSave: (updates: Partial<AboutInfo>) => void;
  onCancel: () => void;
}

export default function AboutForm({ about, onSave, onCancel }: AboutFormProps) {
  const [formData, setFormData] = useState<Partial<AboutInfo>>(
    about || {
      name: '',
      title: '',
      bio: '',
      avatar: '',
      location: '',
      email: '',
      phone: '',
      website: '',
      github: '',
      linkedin: '',
      twitter: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden glass-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {about ? 'Modifier mon profil' : 'Créer mon profil'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Mettez à jour vos informations personnelles, votre présentation et vos liens de contact.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
          
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" /> Informations de base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nom complet <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Titre professionnel <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ex: Développeur Full-Stack"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground"/> URL de la photo de profil
              </Label>
              <Input
                id="avatar"
                value={formData.avatar || ''}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">Biographie / À propos <span className="text-destructive">*</span></Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 resize-y"
                placeholder="Présentez-vous en quelques lignes..."
                required
              />
            </div>
          </div>

          {/* Coordonnées */}
          <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-border/30">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Coordonnées matérielles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground"/> Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground"/> Téléphone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground"/> Localisation
                </Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="Ville, Pays"
                />
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <AtSign className="h-5 w-5 text-primary" /> Présence en ligne
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground"/> Site web personnel
                </Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="text-foreground flex items-center gap-2">
                  <Github className="h-3.5 w-3.5 text-muted-foreground"/> GitHub
                </Label>
                <Input
                  id="github"
                  value={formData.github || ''}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-foreground flex items-center gap-2">
                  <Linkedin className="h-3.5 w-3.5 text-muted-foreground"/> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-foreground flex items-center gap-2">
                  <Twitter className="h-3.5 w-3.5 text-muted-foreground"/> Twitter / X
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter || ''}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="bg-background border-border/50 focus-visible:ring-primary/50"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}