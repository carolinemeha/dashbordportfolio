import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  // In Next.js 13 Route Handlers, cookies() is safe for reading
  const token = cookies().get(JWT_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  return NextResponse.json({
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  });
}
