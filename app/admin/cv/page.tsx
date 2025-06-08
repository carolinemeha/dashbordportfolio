'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, CVInfo } from '@/lib/data';
import { Edit, FileText, Download, Upload } from 'lucide-react';
import CVForm from '../../../components/admin/CVForm';

export default function CVPage() {
  const [cv, setCV] = useState<CVInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const cvData = dataService.getCVInfo();
    setCV(cvData);
  }, []);

  const handleUpdate = (updates: Partial<CVInfo>) => {
    dataService.updateCV(updates as CVInfo);
    setCV(dataService.getCVInfo());
    setIsFormOpen(false);
  };

  const openEditForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here, you would implement the logic to upload the file
      // and update the CV with the new file
      console.log('File to upload:', file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">CV</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez votre CV et ses informations
          </p>
        </div>
        <Button onClick={openEditForm}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {!cv ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre CV</p>
            <Button onClick={openEditForm}>
              <Edit className="h-4 w-4 mr-2" />
              Ajouter mon CV
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Nom du fichier</h4>
                <p className="text-sm text-gray-600">{cv.fileName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Date de téléchargement</h4>
                <p className="text-sm text-gray-600">{cv.uploadDate}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Taille du fichier</h4>
                <p className="text-sm text-gray-600">{cv.fileSize}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fichier CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{cv.fileName}</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={'/'} download>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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