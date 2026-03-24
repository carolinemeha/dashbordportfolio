'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, CVInfo } from '@/lib/data';
import { Edit, FileText, Download, Upload, Trash2, History } from 'lucide-react';
import CVForm from '../../../components/admin/CVForm';
import { toast } from 'sonner';
import { formatDate, formatFileSize } from '@/lib/utils';
import PDFPreview from '@/components/admin/PDFPreview';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CVPage() {
  const [cv, setCV] = useState<CVInfo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [versions, setVersions] = useState<CVInfo[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCVData();
  }, []);

  const loadCVData = async () => {
    setIsLoading(true);
    try {
      const cvData = dataService.getCVInfo();
      setCV(cvData);
      setFilePreview(cvData?.fileUrl || null);
      setVersions(dataService.getCVVersions());
    } catch (error) {
      console.error('Failed to load CV data:', error);
      toast.error('Erreur lors du chargement des données du CV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<CVInfo>) => {
    try {
      await dataService.updateCV(updates as CVInfo);
      await loadCVData();
      setIsFormOpen(false);
      toast.success('CV mis à jour avec succès');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Erreur lors de la mise à jour du CV');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez uploader un fichier PDF');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Le fichier est trop volumineux (max ${formatFileSize(MAX_FILE_SIZE)})`);
      return;
    }

    try {
      // Simulate file upload
      const fileUrl = URL.createObjectURL(file);
      const newCV: CVInfo = {
        ...cv,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        uploadDate: formatDate(new Date()),
        fileUrl,
        version: cv ? cv.version + 1 : 1,
        educations: cv?.educations || [],
        experiences: cv?.experiences || [],
        skills: cv?.skills || [],
        projects: cv?.projects || [],
        testimonials: cv?.testimonials || [],
        aboutInfo: cv?.aboutInfo || undefined,
      };

      await dataService.updateCV(newCV);
      await loadCVData();
      toast.success('CV uploadé avec succès');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Erreur lors de l'upload du CV");
    }
  };

  const handleDownload = () => {
    if (!cv?.fileUrl) {
      toast.error('Aucun fichier à télécharger');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = cv.fileUrl;
      link.download = cv.fileName || 'mon-cv.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const restoreVersion = async (version: CVInfo) => {
    try {
      await dataService.updateCV(version);
      await loadCVData();
      setShowVersions(false);
      toast.success('Version restaurée avec succès');
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  const deleteCV = async () => {
    try {
      await dataService.deleteCV();
      await loadCVData();
      toast.success('CV supprimé avec succès');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Curriculum Vitae</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez et mettez à jour votre CV professionnel
          </p>
        </div>
        <div className="flex gap-2">
          {cv && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowVersions(!showVersions)}
                disabled={isLoading}
              >
                <History className="h-4 w-4 mr-2" />
                Versions
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteCV}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </>
          )}
          <Button 
            onClick={() => setIsFormOpen(true)}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-2" />
            {cv ? 'Modifier' : 'Ajouter'} CV
          </Button>
        </div>
      </div>

      {showVersions && versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anciennes versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{version.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {version.uploadDate} - {version.fileSize}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => restoreVersion(version)}
                      disabled={isLoading}
                    >
                      Restaurer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      disabled={isLoading}
                    >
                      <a href={version.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Chargement en cours...</p>
        </div>
      ) : !cv ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV disponible</h3>
            <p className="text-gray-500 mb-6">Commencez par uploader votre CV au format PDF</p>
            <label htmlFor="upload-cv">
              <Button asChild>
                <div className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader un CV
                </div>
              </Button>
              <input
                id="upload-cv"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Nom du fichier</h4>
                  <p className="text-sm text-gray-600">{cv.fileName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Date de téléchargement</h4>
                    <p className="text-sm text-gray-600">{cv.uploadDate}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Taille du fichier</h4>
                    <p className="text-sm text-gray-600">{cv.fileSize}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Version</h4>
                  <p className="text-sm text-gray-600">{cv.version}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={handleDownload} disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <label htmlFor="replace-cv">
                  <Button variant="outline" asChild disabled={isLoading}>
                    <div className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Remplacer
                    </div>
                  </Button>
                  <input
                    id="replace-cv"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Prévisualisation</CardTitle>
              </CardHeader>
              <CardContent>
                {filePreview ? (
                  <PDFPreview fileUrl={filePreview} />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Aucune prévisualisation disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isFormOpen && (
        <CVForm
          cv={cv}
          onSave={handleUpdate}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}