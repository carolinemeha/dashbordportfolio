'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dataService, Certification } from '@/lib/data';
import { Plus, Edit, Trash2, Award, Calendar, Building, LinkIcon } from 'lucide-react';
import CertificationForm from '@/components/admin/CertificationForm';
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
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getCertifications();
      setCertifications(data);
    };
    fetchData();
  }, []);

  const handleCreate = async (cert: Omit<Certification, 'id'>) => {
    const newCert = await dataService.createCertification(cert);
    if (newCert) {
      setCertifications([...certifications, newCert]);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (cert: Omit<Certification, 'id'>) => {
    if (editingCert) {
      const updated = await dataService.updateCertification(editingCert.id, cert);
      if (updated) {
        setCertifications(certifications.map(c => c.id === editingCert.id ? updated : c));
      }
      setEditingCert(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      const success = await dataService.deleteCertification(id);
      if (success) {
        setCertifications(certifications.filter(c => c.id !== id));
      }
    }
  };

  const openEditForm = (cert: Certification) => {
    setEditingCert(cert);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCert(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } as any}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Certifications
          </motion.h1>
          <motion.p 
            {...{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 } } as any}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez vos diplômes, certifications et reconnaissances professionnelles.
          </motion.p>
        </div>
        <motion.div {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } } as any}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une certification
          </Button>
        </motion.div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {certifications.map((cert) => (
            <motion.div 
              key={cert.id} 
              variants={itemVariants}
              layout
              exit="exit"
            >
              <Card className="glass-card group hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                  <div className="flex-1 pr-4">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {cert.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-2 font-medium text-foreground/70">
                      <Building className="h-3.5 w-3.5" />
                      {cert.issuer}
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0 pb-6">
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <Calendar className="h-4 w-4" />
                      {cert.date}
                    </div>
                    {cert.credential && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate italic">
                        <LinkIcon className="h-3.5 w-3.5" />
                        {cert.credential}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(cert)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {certifications.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-6 bg-secondary/20 rounded-full mb-4">
            <Award className="h-12 w-12 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-xl font-semibold opacity-50">Aucune certification</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">Ajoutez vos diplômes ou certifications professionnelles pour enrichir votre profil.</p>
        </motion.div>
      )}

      {isFormOpen && (
        <CertificationForm
          certification={editingCert}
          onSave={editingCert ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
