import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { getVapidPublicKey } from '@/lib/vapid-client';

function mailConfigured(): boolean {
  const inbox = process.env.MAIL_TO_ADMIN?.trim();
  const from = process.env.MAIL_FROM?.trim() || process.env.CONTACT_FROM?.trim();
  if (!inbox || !from) return false;
  const postal =
    Boolean(process.env.POSTAL_API_URL?.trim()) &&
    Boolean(
      process.env.POSTAL_SERVER_API_KEY?.trim() || process.env.POSTAL_API_KEY?.trim()
    );
  const smtp =
    Boolean(process.env.EMAIL_HOST?.trim()) &&
    Boolean(process.env.EMAIL_USER?.trim()) &&
    Boolean(process.env.EMAIL_PASSWORD?.trim() || process.env.EMAIL_PASS?.trim());
  return postal || smtp;
}

export async function GET() {
  const token = cookies().get(JWT_COOKIE)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const inbox = process.env.MAIL_TO_ADMIN?.trim() || '';
  const masked =
    inbox && inbox.includes('@')
      ? `${inbox.slice(0, 2)}***@${inbox.split('@')[1]}`
      : inbox
        ? '***'
        : null;

  return NextResponse.json({
    mailConfigured: mailConfigured(),
    mailToAdminMasked: masked,
    vapidPublicConfigured: Boolean(getVapidPublicKey()),
    vapidServerHint:
      'Les e-mails et le push serveur sont envoyés depuis la vitrine (Myporfolio). Copiez les clés VAPID et MAIL_* dans son .env.',
  });
}
