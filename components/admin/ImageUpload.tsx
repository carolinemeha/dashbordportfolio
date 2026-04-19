'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  path?: string;
  /** Aperçu carré compact (ex. logo sidebar) */
  compact?: boolean;
  /** Message du toast après envoi réussi du fichier */
  successMessage?: string;
}

/** Vérifie si une URL est hébergée (externe ou Supabase) vs locale */
function isHostedUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function ImageUpload({
  value,
  onChange,
  label,
  bucket = 'portfolio',
  path = 'uploads',
  compact = false,
  successMessage,
}: ImageUploadProps) {
  const { t } = useAdminI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayLabel = label ?? t('imageUpload.defaultLabel');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('imageUpload.invalidImage'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('imageUpload.tooLarge'));
      return;
    }

    setIsUploading(true);
    setImgError(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('path', path);

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'upload');
      }

      onChange(data.url);
      setImgError(false);
      toast.success(successMessage ?? t('imageUpload.defaultSuccess'));
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t('imageUpload.uploadErr', { message }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    onChange('');
    setImgError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFilePicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const hasValidImage = value && isHostedUrl(value) && !imgError;
  const hasLocalUrl = value && !isHostedUrl(value);

  return (
    <div className="space-y-3">
      <Label className="text-foreground flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" /> {displayLabel}
      </Label>

      <div className="flex flex-col gap-4">
        {hasValidImage ? (
          <div
            className={
              compact
                ? 'relative group h-28 w-28 rounded-2xl overflow-hidden border border-border/50 bg-secondary/20 shrink-0'
                : 'relative group w-full aspect-video md:aspect-[2/1] rounded-xl overflow-hidden border border-border/50 bg-secondary/20'
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className={
                compact
                  ? 'w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105'
                  : 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
              }
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="h-8 rounded-full"
              >
                <X className="h-4 w-4 mr-1" /> {t('imageUpload.remove')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={triggerFilePicker}
                disabled={isUploading}
                className="h-8 rounded-full"
              >
                <Upload className="h-4 w-4 mr-1" /> {t('imageUpload.replace')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {hasLocalUrl && (
              <div className="flex items-start gap-2 p-3 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">{t('imageUpload.localTitle')}</p>
                  <p className="opacity-80 mt-0.5">
                    {t('imageUpload.localDesc', { path: value })}
                  </p>
                </div>
              </div>
            )}

            <div
              onClick={triggerFilePicker}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${
                compact ? 'p-6 max-w-xs' : 'p-10'
              } ${
                isUploading
                  ? 'border-primary/60 bg-primary/5 cursor-wait'
                  : 'border-border/40 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40'
              }`}
            >
              <div
                className={`rounded-full flex items-center justify-center transition-transform ${
                  compact ? 'h-11 w-11' : 'h-14 w-14'
                } ${
                  isUploading ? 'bg-primary/20' : 'bg-primary/10 group-hover:scale-110'
                }`}
              >
                {isUploading ? (
                  <Loader2 className={`text-primary animate-spin ${compact ? 'h-6 w-6' : 'h-7 w-7'}`} />
                ) : (
                  <Upload className={`text-primary ${compact ? 'h-6 w-6' : 'h-7 w-7'}`} />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {isUploading
                    ? t('imageUpload.uploading')
                    : hasLocalUrl
                      ? t('imageUpload.clickUpload')
                      : compact
                        ? t('imageUpload.logoCompact')
                        : t('imageUpload.profileHint')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('imageUpload.formats')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setImgError(false);
            }}
            placeholder={t('imageUpload.urlPlaceholder')}
            className="bg-secondary/30 border-border/50 focus-visible:ring-primary/50 text-xs font-mono"
          />
          {value && isHostedUrl(value) && !imgError && (
            <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />
    </div>
  );
}
