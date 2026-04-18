'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  path?: string;
}

/** Vérifie si une URL est hébergée (externe ou Supabase) vs locale */
function isHostedUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = "Image", 
  bucket = "portfolio",
  path = "uploads"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop lourde (max 5 Mo).");
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
        throw new Error(data.error ?? 'Erreur upload');
      }

      onChange(data.url);
      setImgError(false);
      toast.success('✓ Photo de profil mise à jour !');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erreur upload: ${error.message}`);
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

  // URL valide et hébergée → afficher l'image
  const hasValidImage = value && isHostedUrl(value) && !imgError;
  // URL locale (ex: /assets/avatar.jpeg) → avertissement
  const hasLocalUrl = value && !isHostedUrl(value);

  return (
    <div className="space-y-3">
      <Label className="text-foreground flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground"/> {label}
      </Label>
      
      <div className="flex flex-col gap-4">
        {hasValidImage ? (
          /* ── Image hébergée valide ─────────────────────────────── */
          <div className="relative group w-full aspect-video md:aspect-[2/1] rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                type="button" variant="destructive" size="sm" 
                onClick={removeImage} className="h-8 rounded-full"
              >
                <X className="h-4 w-4 mr-1" /> Supprimer
              </Button>
              <Button 
                type="button" variant="secondary" size="sm"
                onClick={triggerFilePicker} disabled={isUploading}
                className="h-8 rounded-full"
              >
                <Upload className="h-4 w-4 mr-1" /> Remplacer
              </Button>
            </div>
          </div>
        ) : (
          /* ── Zone de drop / upload ─────────────────────────────── */
          <div>
            {hasLocalUrl && (
              /* Avertissement si chemin local */
              <div className="flex items-start gap-2 p-3 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold">Image locale détectée</p>
                  <p className="opacity-80 mt-0.5">
                    Le chemin <code className="font-mono">{value}</code> n'est pas accessible en ligne. 
                    Uploadez une image depuis votre appareil pour la stocker sur Supabase.
                  </p>
                </div>
              </div>
            )}

            <div 
              onClick={triggerFilePicker}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${
                isUploading 
                  ? 'border-primary/60 bg-primary/5 cursor-wait' 
                  : 'border-border/40 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/40'
              }`}
            >
              <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-transform ${
                isUploading ? 'bg-primary/20' : 'bg-primary/10 group-hover:scale-110'
              }`}>
                {isUploading ? (
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                ) : (
                  <Upload className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {isUploading 
                    ? 'Upload en cours...' 
                    : hasLocalUrl 
                      ? 'Cliquez pour uploader depuis votre appareil' 
                      : 'Cliquez pour choisir une photo de profil'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP • max 5 Mo</p>
              </div>
            </div>
          </div>
        )}

        {/* Champ URL directe */}
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => { onChange(e.target.value); setImgError(false); }}
            placeholder="Ou collez une URL Supabase / externe ici..."
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
