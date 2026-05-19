/**
 * Appels base de données admin depuis le navigateur (cookie JWT + service role côté serveur).
 */
export async function adminRpc<T>(op: string, args?: unknown): Promise<T> {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, args: args ?? {} }),
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Réponse admin DB invalide (${res.status})`);
  }

  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : res.statusText;
    throw new Error(msg || `Erreur ${res.status}`);
  }

  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    (body as { error?: unknown }).error
  ) {
    throw new Error(String((body as { error: unknown }).error));
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  throw new Error('Réponse admin DB sans champ data');
}
