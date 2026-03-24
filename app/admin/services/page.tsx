'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, Service } from '@/lib/data';
import { Plus, Edit, Trash2, Settings, Star, ArrowUp, ArrowDown } from 'lucide-react';
import ServiceForm from '@/components/admin/ServiceForm';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


useEffect(() => {
  const fetchServices = () => {
    try {
      setIsLoading(true);
      const servicesData = dataService.getServices();
      // Triez les services par displayOrder
      const sortedServices = [...servicesData].sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setServices(sortedServices);
    } catch (err) {
      setError('Erreur lors du chargement des services');
    } finally {
      setIsLoading(false);
    }
  };

  fetchServices();
}, [isFormOpen]);

  const handleFormSubmit = (serviceData: Omit<Service, 'id'>) => {
    try {
      if (editingService) {
        // Mise à jour du service existant
        handleUpdate(editingService.id, serviceData);
      } else {
        // Création d'un nouveau service
        handleCreate(serviceData);
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'opération.',
        variant: 'destructive',
      });
    }
  };


const handleCreate = async (serviceData: Omit<Service, 'id'>) => {
  try {
    const newService = await dataService.createService(serviceData);
    setServices(prev => [...prev, newService]); 
    setIsFormOpen(false);
    toast({
      title: 'Service créé',
      description: 'Le service a été ajouté avec succès.',
      variant: 'default',
    });
  } catch (err) {
    toast({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la création du service.',
      variant: 'destructive',
    });
    
    setServices(dataService.getServices());
  }
};

  const handleUpdate = (id: string, updates: Partial<Service>) => {
    try {
      dataService.updateService(id, updates);
      setServices(dataService.getServices());
      setEditingService(null);
      setIsFormOpen(false);
      toast({
        title: 'Service mis à jour',
        description: 'Le service a été modifié avec succès.',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du service.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.')) {
      try {
        dataService.deleteService(id);
        setServices(dataService.getServices());
        toast({
          title: 'Service supprimé',
          description: 'Le service a été supprimé avec succès.',
          variant: 'default',
        });
      } catch (err) {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression du service.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleMoveUp = async (index: number) => {
  if (index <= 0) return;
  const newServices = [...services];
  [newServices[index], newServices[index - 1]] = [newServices[index - 1], newServices[index]];
  
  newServices.forEach((service, idx) => {
    service.displayOrder = idx;
  });

  try {
    await dataService.reorderServices(newServices);
    setServices(newServices);
  } catch (err) {
    toast({
      title: 'Erreur',
      description: 'Erreur lors de la mise à jour de l\'ordre',
      variant: 'destructive',
    });

    setServices(dataService.getServices());
  }
};

  const handleMoveDown = (index: number) => {
    if (index >= services.length - 1) return;
    const newServices = [...services];
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    newServices[index].displayOrder = index;
    newServices[index + 1].displayOrder = index + 1;
    setServices(newServices);
    // Ici vous devriez aussi mettre à jour l'ordre dans votre base de données
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des services</h1>
          <p className="mt-2 text-sm text-gray-700">
            Créez et gérez les services proposés à vos clients
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau service
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mt-2" />
                <Skeleton className="h-4 w-4/6 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service disponible</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter vos premiers services</p>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((service, index) => (
                <Card key={service.id} className="relative">
                  {service.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Vedette
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription>{service.shortDescription}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(service)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          title="Supprimer"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">{service.description}</p>
                    {service.features && service.features.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Déplacer vers le haut"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === services.length - 1}
                          title="Déplacer vers le bas"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge variant="outline">Ordre: {service.displayOrder || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ServiceForm
              service={editingService || undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}