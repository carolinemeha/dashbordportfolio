'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, CVInfo } from '@/lib/data';
import { Edit, FileText, Download, Upload, Clock, HardDrive } from 'lucide-react';
import CVForm from '../../../components/admin/CVForm';
import { motion } from 'framer-motion';

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

export default function CVPage() {
  const [cv, setCV] = useState<CVInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cvData = await dataService.getCVInfo();
      setCV(cvData);
    };
    fetchData();
  }, []);

  const handleUpdate = async (updates: Partial<CVInfo>) => {
    const updated = await dataService.updateCV(updates as CVInfo);
    if (updated) {
      setCV(updated);
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Curriculum Vitae
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez votre document CV téléchargeable
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button onClick={openEditForm} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Edit className="h-4 w-4 mr-2" />
            {cv ? 'Mettre à jour le CV' : 'Ajouter un CV'}
          </Button>
        </motion.div>
      </div>

      {!cv ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun CV disponible</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Vous n'avez pas encore mis en ligne de CV ou lien de téléchargement.</p>
              <Button onClick={openEditForm} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Mettre en ligne mon CV
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Détails du document
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Nom du fichier
                  </h4>
                  <p className="font-medium text-foreground text-lg break-all">{cv.fileName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Date de mise à jour
                    </h4>
                    <p className="font-medium text-foreground/80">{cv.uploadDate}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <HardDrive className="h-3.5 w-3.5" /> Taille estimée
                    </h4>
                    <p className="font-medium text-foreground/80">{cv.fileSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" /> Téléchargement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-secondary/50 to-secondary/10 rounded-xl border border-border/40 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border border-border/50 flex items-center justify-center mb-4 text-primary">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{cv.fileName}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Document prêt à être téléchargé par vos visiteurs.</p>
                  
                  <Button className="w-full sm:w-auto shadow-md" asChild>
                    <a href={cv.url || '#'} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-2" />
                      Visualiser / Télécharger le CV
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {isFormOpen && (
        <CVForm
          cv={cv}
          onSave={handleUpdate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}