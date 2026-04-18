'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, Service } from '@/lib/data';
import { Plus, Edit, Trash2, Settings, Zap, CheckCircle2 } from 'lucide-react';
import ServiceForm from '@/components/admin/ServiceForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Cpu, Tag as TagIcon, LayoutGrid } from 'lucide-react';
import IconRenderer from '@/components/admin/IconRenderer';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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
    const fetchData = async () => {
      const data = await dataService.getServices();
      setServices(data || []);
    };
    fetchData();
  }, []);

  const handleCreate = async (serviceData: Omit<Service, 'id'>) => {
    const newService = await dataService.createService(serviceData);
    if (newService) {
      const refreshedData = await dataService.getServices();
      setServices(refreshedData);
      setIsFormOpen(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Service>) => {
    const updated = await dataService.updateService(id, updates);
    if (updated) {
      const refreshedData = await dataService.getServices();
      setServices(refreshedData);
      setEditingService(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      const success = await dataService.deleteService(id);
      if (success) {
        const refreshedData = await dataService.getServices();
        setServices(refreshedData);
      }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md pb-4 pt-4 mb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-border/40 shadow-sm">
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
                      <div className="flex flex-col gap-4 w-full">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner border border-white/10 text-primary shrink-0">
                          <IconRenderer iconName={service.iconName} className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <CardTitle className="text-xl font-bold text-foreground m-0">{service.title}</CardTitle>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-0.5 shadow-sm">
                              <Button variant="ghost" size="icon" onClick={() => openEditForm(service)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {service.category && (
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 h-4 bg-primary/5 text-primary border-primary/20">
                              {service.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                    <CardContent className="pt-5 flex-1 flex flex-col z-10 relative">
                    <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1 line-clamp-3">{service.description}</p>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                           <CheckCircle2 className="h-3 w-3" /> Fonctionnalités
                        </h4>
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

                    {service.technologies && service.technologies.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs uppercase font-bold text-muted-foreground mb-3 flex items-center gap-2">
                           <Cpu className="h-3 w-3" /> Technologies utilisées
                        </h4>
                        <TooltipProvider>
                          <div className="flex flex-wrap gap-2">
                            {service.technologies.map((tech, idx) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center text-primary border border-border/40 hover:bg-secondary/80 transition-all cursor-help group/tech">
                                    <IconRenderer iconName={tech.icon} className="h-5 w-5 group-hover/tech:scale-110 transition-transform" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tech.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {service.pricing && (Object.keys(service.pricing).length > 0) && (
                      <div className="mt-auto pt-3 border-t border-border/30">
                         <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Tarification</h4>
                         <div className="flex flex-col gap-1 text-sm">
                            {service.pricing.basic && (
                               <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded">
                                  <span className="text-muted-foreground">Basic</span>
                                  <span className="font-semibold text-foreground">{service.pricing.basic}</span>
                               </div>
                            )}
                            {service.pricing.standard && (
                               <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded">
                                  <span className="text-muted-foreground">Standard</span>
                                  <span className="font-semibold text-foreground">{service.pricing.standard}</span>
                               </div>
                            )}
                            {service.pricing.premium && (
                               <div className="flex justify-between items-center bg-secondary/30 px-2 py-1 rounded">
                                  <span className="text-muted-foreground">Premium</span>
                                  <span className="font-semibold text-foreground">{service.pricing.premium}</span>
                               </div>
                            )}
                         </div>
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