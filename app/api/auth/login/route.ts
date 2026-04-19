import { NextRequest, NextResponse } from 'next/server';
import { signToken, JWT_COOKIE } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@portfolio.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword.trim()) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const displayName =
      process.env.ADMIN_DISPLAY_NAME?.trim() || 'Administrateur';

    const token = await signToken({
      sub: '1',
      email: adminEmail,
      name: displayName,
      role: 'admin',
    });

    // In Next.js 13, set cookies via NextResponse
    const response = NextResponse.json({
      success: true,
      name: displayName,
      email: adminEmail,
    });

    response.cookies.set(JWT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 heures
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
