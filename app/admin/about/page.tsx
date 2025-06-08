'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, About } from '@/lib/data';
import { Edit, User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter } from 'lucide-react';
import AboutForm from '@/components/admin/AboutForm';

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const aboutData = dataService.getAbout();
    setAbout(aboutData);
  }, []);

  const handleUpdate = (updates: Partial<About>) => {
    dataService.updateAbout(updates);
    setAbout(dataService.getAbout());
    setIsFormOpen(false);
  };

  const openEditForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">À propos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez vos informations personnelles
          </p>
        </div>
        <Button onClick={openEditForm}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {!about ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune information</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter vos informations personnelles</p>
            <Button onClick={openEditForm}>
              <Edit className="h-4 w-4 mr-2" />
              Ajouter mes informations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{about.name}</p>
                  <p className="text-sm text-gray-500">{about.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600">{about.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600">{about.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600">{about.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {about.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <a href={about.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {about.website}
                  </a>
                </div>
              )}
              {about.github && (
                <div className="flex items-center space-x-3">
                  <Github className="h-5 w-5 text-gray-400" />
                  <a href={about.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {about.github}
                  </a>
                </div>
              )}
              {about.linkedin && (
                <div className="flex items-center space-x-3">
                  <Linkedin className="h-5 w-5 text-gray-400" />
                  <a href={about.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {about.linkedin}
                  </a>
                </div>
              )}
              {about.twitter && (
                <div className="flex items-center space-x-3">
                  <Twitter className="h-5 w-5 text-gray-400" />
                  <a href={about.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {about.twitter}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>À propos de moi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{about.bio}</p>
            </CardContent>
          </Card>
        </div>
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