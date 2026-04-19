'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVInfo } from '@/lib/data';
import { FileText, Link as LinkIcon, HardDrive, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface CVFormProps {
  cv: CVInfo | null;
  onSave: (updates: Partial<CVInfo>) => void;
  onCancel: () => void;
}

export default function CVForm({ cv, onSave, onCancel }: CVFormProps) {
  const { t, dateLocale } = useAdminI18n();

  const emptyCvForm = useCallback((): Partial<CVInfo> => ({
    fileName: '',
    uploadDate: new Date().toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    fileSize: '',
    url: '',
  }), [dateLocale]);

  const [formData, setFormData] = useState<Partial<CVInfo>>(() =>
    cv ? { ...cv } : emptyCvForm()
  );

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData(cv ? { ...cv } : emptyCvForm());
  }, [cv, emptyCvForm]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error(t('forms.cv.toastPdf'));
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cv_${Date.now()}.${fileExt}`;
      const filePath = `cv/${fileName}`;

      const { error } = await supabase.storage.from('portfolio').upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('portfolio').getPublicUrl(filePath);

      setFormData({
        ...formData,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        url: publicUrl,
        uploadDate: new Date().toLocaleDateString(dateLocale, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      });

      toast.success(t('forms.cv.toastOk'));
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t('forms.cv.toastErr', { message }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const hasCloudUrl = Boolean(
    formData.url &&
      (formData.url.includes('supabase.co') ||
        formData.url.includes('storage.googleapis.com') ||
        formData.url.includes('/storage/v1/object'))
  );

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-xl glass-card border-border/50 sm:p-6">
        <DialogHeader className="pb-4 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {cv ? t('forms.cv.titleEdit') : t('forms.cv.titleNew')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('forms.cv.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label className="text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                {t('forms.cv.uploadLabel')}
              </Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 hover:bg-primary/5 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                    <p className="text-sm font-medium">{t('forms.cv.uploading')}</p>
                  </div>
                ) : hasCloudUrl ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-600">{t('forms.cv.cloudOk')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('forms.cv.clickChange')}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-medium">{t('forms.cv.dropTitle')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('forms.cv.dropHint')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileName" className="text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t('forms.cv.displayName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fileName"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.cv.displayNamePh')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                {t('forms.cv.url')}
              </Label>
              <Input
                id="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.cv.urlPh')}
              />
              <p className="text-xs text-muted-foreground">{t('forms.cv.urlHelp')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileSize" className="text-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                {t('forms.cv.sizeLabel')}
              </Label>
              <Input
                id="fileSize"
                value={formData.fileSize || ''}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
                placeholder={t('forms.cv.sizePh')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('forms.shared.cancel')}
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25">
              {t('forms.shared.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
