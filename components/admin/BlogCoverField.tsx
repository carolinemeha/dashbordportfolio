'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageIcon, ExternalLink } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { resolveVitrineAssetUrl } from '@/lib/vitrine-url';

type BlogCoverFieldProps = {
  value: string;
  onChange: (url: string) => void;
  slug?: string;
  label?: string;
  uploadSuccessMessage?: string;
};

export default function BlogCoverField({
  value,
  onChange,
  slug = '',
  label = 'Image de couverture',
  uploadSuccessMessage,
}: BlogCoverFieldProps) {
  const [imgError, setImgError] = useState(false);
  const previewUrl = useMemo(() => resolveVitrineAssetUrl(value), [value]);
  const suggestedPath = slug.trim()
    ? `/assets/blog/cover-${slug.trim().replace(/\s+/g, '-')}.svg`
    : '';

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
      <Label className="flex items-center gap-2 text-foreground">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Chemin vitrine (ex. <code className="text-[11px]">/assets/blog/cover-mon-slug.svg</code>) ou URL
        Supabase après upload. Ratio recommandé 1200×630.
      </p>

      {previewUrl && !imgError ? (
        <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-lg border border-border/60 bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Aperçu couverture blog"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : value ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Aperçu indisponible — vérifiez le chemin ou que la vitrine tourne (
          {resolveVitrineAssetUrl('/assets/blog/')}).
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setImgError(false);
          }}
          placeholder="/assets/blog/cover-mon-article.svg"
          className="font-mono text-xs bg-secondary/30"
        />
        {suggestedPath && value !== suggestedPath ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => {
              onChange(suggestedPath);
              setImgError(false);
            }}
          >
            Suggérer selon slug
          </Button>
        ) : null}
        {previewUrl ? (
          <Button type="button" variant="ghost" size="sm" className="shrink-0" asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Vitrine
            </a>
          </Button>
        ) : null}
      </div>

      <ImageUpload
        value={value}
        onChange={(url) => {
          onChange(url);
          setImgError(false);
        }}
        path="blog"
        bucket="portfolio"
        successMessage={uploadSuccessMessage}
      />
    </div>
  );
}
