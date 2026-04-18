// Client-side auth utilities (UI only — no secrets here)
// Real auth is enforced server-side via JWT cookie + middleware

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Appelle /api/auth/me pour récupérer l'utilisateur courant depuis le cookie JWT.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Appelle /api/auth/logout pour effacer la session.
 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}