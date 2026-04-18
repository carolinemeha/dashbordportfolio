'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, Service } from '@/lib/data';
import { Plus, Edit, Trash2, Settings, Zap, CheckCircle2 } from 'lucide-react';
import ServiceForm from '@/components/admin/ServiceForm';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    setServices(dataService.getServices());
  }, []);

  const handleCreate = (serviceData: Omit<Service, 'id'>) => {
    const newService = dataService.createService(serviceData);
    setServices(dataService.getServices());
    setIsFormOpen(false);
  };

  const handleUpdate = (id: string, updates: Partial<Service>) => {
    dataService.updateService(id, updates);
    setServices(dataService.getServices());
    setEditingService(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      dataService.deleteService(id);
      setServices(dataService.getServices());
    }
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
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
            Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Gérez les offres et prestations que vous proposez
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau service
          </Button>
        </motion.div>
      </div>

      {services.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-dashed border-2 border-border/50 bg-secondary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Settings className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun service</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Vous n'avez pas encore défini de services. Ajoutez-en pour montrer ce que vous pouvez apporter à vos clients.</p>
              <Button onClick={() => setIsFormOpen(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Créer un service
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
            {services.map((service) => (
              <motion.div key={service.id} variants={itemVariants} exit="exit" layout className="h-full">
                <Card className="glass-card overflow-hidden group border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col relative">
                  
                  {/* Decorative background glow */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                  
                  <CardHeader className="pb-4 border-b border-border/20 z-10 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/50 rounded-lg text-primary border border-border/40 shadow-sm top">
                          {/* We could use service.icon here if we stored lucide icons names, using a default for now */}
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground m-0">{service.title}</CardTitle>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-0.5 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(service)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 flex-1 flex flex-col z-10 relative">
                    <CardDescription className="text-sm font-medium text-primary m-0 mb-3 block">{service.shortDescription}</CardDescription>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1 line-clamp-3">{service.description}</p>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="mt-auto">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Inclus</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm text-foreground/70 group/feature">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mr-2 opacity-70 group-hover/feature:opacity-100 transition-opacity mt-0.5" />
                              <span className="leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
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
        <ServiceForm
          service={editingService}
          onSave={editingService ? 
            (updates) => handleUpdate(editingService.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
        />
      )}
    </div>
  );
} 