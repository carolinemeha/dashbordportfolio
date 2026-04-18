import { NextResponse } from 'next/server';
import { JWT_COOKIE } from '@/lib/auth-server';

export async function POST() {
  // Expire the cookie by setting maxAge=0
  const response = NextResponse.json({ success: true });
  response.cookies.set(JWT_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
