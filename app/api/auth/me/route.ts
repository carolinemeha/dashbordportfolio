import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';
import { fromDbJson, pickLocalized } from '@/lib/locale-text';

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
    .select(
      'name, name_i18n, title, title_i18n, email, phone, avatar, location, location_i18n'
    )
    .limit(1)
    .maybeSingle();

  const aboutRow = about as Record<string, unknown> | null;
  const nameI18n = fromDbJson(
    aboutRow?.name_i18n,
    aboutRow?.name != null ? String(aboutRow.name) : null
  );
  const titleI18n = fromDbJson(
    aboutRow?.title_i18n,
    aboutRow?.title != null ? String(aboutRow.title) : null
  );
  const locationI18n = fromDbJson(
    aboutRow?.location_i18n,
    aboutRow?.location != null ? String(aboutRow.location) : null
  );

  const displayName =
    pickLocalized(nameI18n, 'fr').trim() || payload.name;
  const publicEmail =
    about?.email != null && String(about.email).trim() !== ''
      ? String(about.email).trim()
      : null;

  const titleShown = pickLocalized(titleI18n, 'fr').trim();
  const locationShown = pickLocalized(locationI18n, 'fr').trim();

  return NextResponse.json({
    id: payload.sub,
    email: payload.email,
    name: displayName,
    sessionEmail: payload.email,
    role: payload.role,
    title: titleShown || null,
    publicEmail,
    phone: about?.phone != null ? String(about.phone) : null,
    avatarUrl: about?.avatar != null ? String(about.avatar) : null,
    location: locationShown || null,
  });
}
