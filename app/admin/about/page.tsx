'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dataService, AboutInfo } from '@/lib/data';
import { Edit, User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, AtSign, Info, Briefcase, Languages, ShoppingBag, Youtube } from 'lucide-react';
import AboutForm from '../../../components/admin/AboutForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, FileText } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AboutPage() {
  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const aboutData = await dataService.getAboutInfo();
      setAbout(aboutData);
    };
    fetchData();
  }, []);

  const handleUpdate = async (updates: Partial<AboutInfo>) => {
    const updatedAbout = await dataService.updateAboutInfo(updates);
    if (updatedAbout) {
      setAbout(updatedAbout);
      setIsFormOpen(false);
    }
  };

  const openEditForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } as any}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            À propos de moi
          </motion.h1>
          <motion.p 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 } } as any}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez vos informations personnelles et vos coordonnées
          </motion.p>
        </div>
        <motion.div {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } } as any}>
          <Button onClick={openEditForm} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Edit className="h-4 w-4 mr-2" />
            {about ? 'Modifier le profil' : 'Créer mon profil'}
          </Button>
        </motion.div>
      </div>

      {!about ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <User className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune information</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Commencez par ajouter vos informations personnelles pour que les visiteurs puissent vous découvrir.</p>
              <Button onClick={openEditForm} size="lg">
                <Edit className="h-4 w-4 mr-2" />
                Ajouter mes informations
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            {/* Profil Rapide */}
            <Card className="glass-card overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
              <CardContent className="pt-10 flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background shadow-xl flex items-center justify-center mb-4 overflow-hidden relative">
                   {about.avatar ? (
                     <img src={about.avatar} alt={about.name} className="w-full h-full object-cover" />
                   ) : (
                    <User className="h-10 w-10 text-muted-foreground opacity-50" />
                   )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{about.name}</h2>
                <p className="text-primary font-medium mt-1">{about.title}</p>
                
                {about.roles && about.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3 px-4">
                    {about.roles.map((role, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 px-2">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="w-full h-px bg-border/40 my-6"></div>
                
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-foreground/80 truncate">{about.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Téléphone</p>
                      <p className="text-sm font-medium text-foreground/80">{about.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Localisation</p>
                      <p className="text-sm font-medium text-foreground/80">{about.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations additionnelles */}
            <Card className="glass-card">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Informations clés
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Expérience</span>
                  </div>
                  <span className="text-sm font-semibold">{about.experience || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Nationalité</span>
                  </div>
                  <span className="text-sm font-semibold">{about.nationality || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Freelance</span>
                  </div>
                  <span className="text-sm font-semibold">{about.freelanceStatus || "-"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Timezone</span>
                  </div>
                  <span className="text-sm font-semibold">{about.timezone || "-"}</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3 mb-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Disponibilité</span>
                  </div>
                  <p className="text-sm font-semibold pl-7">{about.availableStatus || "-"}</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/30">
                  <div className="flex items-center space-x-3 mb-1">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Langues</span>
                  </div>
                  <p className="text-sm font-semibold pl-7">{about.languages || "-"}</p>
                </div>
                {about.cvUrl && (
                  <Button variant="outline" size="sm" className="w-full mt-2 border-primary/20 hover:bg-primary/5 group" asChild>
                    <a href={about.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      Télécharger mon CV
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Réseaux Sociaux */}
            <Card className="glass-card">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-primary" />
                  Présence en ligne
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-1">
                {about.website && (
                  <a href={about.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">Site Intenet</span>
                    </div>
                  </a>
                )}
                {about.shopUrl && (
                  <a href={about.shopUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">Boutique en ligne</span>
                    </div>
                  </a>
                )}
                {about.github && (
                  <a href={about.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">GitHub</span>
                    </div>
                  </a>
                )}
                {about.linkedin && (
                  <a href={about.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">LinkedIn</span>
                    </div>
                  </a>
                )}
                {about.twitter && (
                  <a href={about.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-[#1DA1F2] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">Twitter / X</span>
                    </div>
                  </a>
                )}
                {about.youtube && (
                  <a href={about.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Youtube className="h-5 w-5 text-muted-foreground group-hover:text-[#FF0000] transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">YouTube</span>
                    </div>
                  </a>
                )}
                {(!about.website && !about.github && !about.linkedin && !about.twitter && !about.youtube && !about.shopUrl) && (
                  <p className="text-sm text-muted-foreground italic">Aucun lien renseigné.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Biographie
                </CardTitle>
                <CardDescription>
                  Ce texte est affiché sur votre page d'accueil pour vous présenter.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {about.bio || "Aucune biographie."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {isFormOpen && (
        <AboutForm
          about={about}
          onSave={handleUpdate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}