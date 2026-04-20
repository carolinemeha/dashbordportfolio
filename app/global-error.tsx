'use client';

/**
 * Erreur à la racine (hors layout). Doit définir html + body.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-8 antialiased">
        <h1 className="text-lg font-semibold">Erreur critique</h1>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {error.message || 'Impossible d’afficher l’application.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
