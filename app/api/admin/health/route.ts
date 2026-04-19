import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';

/**
 * Diagnostic léger : variables d’environnement publiques et lecture table `about`.
 * Ne renvoie aucun secret.
 */
export async function GET() {
  const token = cookies().get(JWT_COOKIE)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

  let aboutReachable = false;
  let latencyMs = 0;
  let aboutError: string | null = null;

  if (hasUrl && hasAnon) {
    const t0 = Date.now();
    const { error } = await supabase.from('about').select('id').limit(1).maybeSingle();
    latencyMs = Date.now() - t0;
    aboutReachable = !error;
    if (error) aboutError = error.message;
  }

  return NextResponse.json({
    ok: hasUrl && hasAnon && aboutReachable,
    checkedAt: new Date().toISOString(),
    environment: {
      nextPublicSupabaseUrl: hasUrl,
      nextPublicSupabaseAnonKey: hasAnon,
    },
    database: {
      aboutTableReachable: aboutReachable,
      latencyMs,
      error: aboutError,
    },
  });
}
