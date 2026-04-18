import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';

const PUBLIC_PATHS = ['/admin/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ne protèger que les routes /admin/*
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Laisser passer les pages publiques (login)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Vérifier le token JWT dans le cookie
  const token = req.cookies.get(JWT_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
