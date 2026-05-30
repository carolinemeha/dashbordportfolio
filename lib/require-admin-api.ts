import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE, type JWTPayload } from '@/lib/auth-server';

/** Vérifie la session admin pour les routes API internes. */
export async function requireAdminApi(): Promise<JWTPayload | null> {
  const token = cookies().get(JWT_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}
