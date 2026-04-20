'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-lg font-semibold text-foreground">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || 'Erreur inattendue. Vous pouvez réessayer ou recharger la page.'}
      </p>
      <Button type="button" onClick={() => reset()}>
        Réessayer
      </Button>
    </div>
  );
}
