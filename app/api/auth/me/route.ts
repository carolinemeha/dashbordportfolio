import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';

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

  const { data: about } = await supabase
    .from('about')
    .select('name, title, email, phone, avatar, location')
    .limit(1)
    .maybeSingle();

  const displayName =
    (about?.name && String(about.name).trim()) || payload.name;
  const publicEmail =
    about?.email != null && String(about.email).trim() !== ''
      ? String(about.email).trim()
      : null;

  return NextResponse.json({
    id: payload.sub,
    email: payload.email,
    name: displayName,
    sessionEmail: payload.email,
    role: payload.role,
    title: about?.title != null ? String(about.title) : null,
    publicEmail,
    phone: about?.phone != null ? String(about.phone) : null,
    avatarUrl: about?.avatar != null ? String(about.avatar) : null,
    location: about?.location != null ? String(about.location) : null,
  });
}
