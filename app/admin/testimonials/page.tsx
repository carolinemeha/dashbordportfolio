'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Testimonial } from '../../../lib/data';
import { Plus, Edit, Trash2, MessageSquare, Star, User, Briefcase } from 'lucide-react';
import TestimonialForm from '../../../components/admin/TestimonialForm';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getTestimonials();
      setTestimonials(data || []);
    };
    fetchData();
  }, []);

  const handleCreate = async (testimonialData: Omit<Testimonial, 'id'>) => {
    const newTestimonial = await dataService.createTestimonial(testimonialData);
    if (newTestimonial) {
      const refreshedData = await dataService.getTestimonials();
      setTestimonials(refreshedData);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Testimonial>) => {
    const updated = await dataService.updateTestimonial(id, updates);
    if (updated) {
      const refreshedData = await dataService.getTestimonials();
      setTestimonials(refreshedData);
      setEditingTestimonial(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      const success = await dataService.deleteTestimonial(id);
      if (success) {
        const refreshedData = await dataService.getTestimonials();
        setTestimonials(refreshedData);
      }
    }
  };

  const openEditForm = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTestimonial(null);
  };  // Trier les témoignages par date (le plus récent en premier)
  const sortedTestimonials = [...testimonials].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-foreground">
        <div>
          <motion.h1 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } as any}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Témoignages Clients
          </motion.h1>
          <motion.p 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 } } as any}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez les retours et recommandations de vos clients
          </motion.p>
        </div>
        <motion.div {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } } as any}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau témoignage
          </Button>
        </motion.div>
      </div>

      {testimonials.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-foreground">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun témoignage</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Ajoutez des témoignages pour renforcer votre crédibilité.</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un témoignage
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {sortedTestimonials.map((testimonial) => (
              <motion.div key={testimonial.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.9 }}>
                <Card className="glass-card h-full flex flex-col hover:border-primary/50 transition-colors group text-foreground">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border flex items-center justify-center shrink-0">
                          {testimonial.avatar ? (
                            <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors truncate">{testimonial.name}</CardTitle>
                          <CardDescription className="text-xs mt-0.5 max-w-full truncate flex items-center gap-1">
                            <Briefcase className="h-3 w-3 inline opacity-70" />
                            {testimonial.role}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditForm(testimonial)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(testimonial.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {testimonial.rating !== undefined && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (testimonial.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]'
                                  : 'text-gray-300 dark:text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-foreground/80 italic text-sm leading-relaxed line-clamp-4 relative">
                        <span className="text-3xl text-primary/20 absolute -top-3 -left-2 leading-none font-serif">&quot;</span>
                        <span className="pl-3 relative z-10">{testimonial.content}</span>
                      </p>
                    </div>
                    {testimonial.date && (
                      <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-secondary/50 font-normal">
                          {new Date(testimonial.date).toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isFormOpen && (
        <TestimonialForm
          testimonial={editingTestimonial}
          onSave={editingTestimonial ? 
            (updates) => handleUpdate(editingTestimonial.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
}