import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import type { AdminLocale } from './admin-locale';
import { isAdminLocale } from './admin-locale';
import { ADMIN_LOCALE_COOKIE } from './admin-locale-cookie';

function pick(locale: AdminLocale, fr: string, en: string): string {
  return locale === 'en' ? en : fr;
}

export function getAdminLocaleFromApiCookie(raw: string | undefined): AdminLocale {
  return isAdminLocale(raw) ? raw : 'fr';
}

export function getAdminLocaleFromRequest(req: NextRequest): AdminLocale {
  return getAdminLocaleFromApiCookie(req.cookies.get(ADMIN_LOCALE_COOKIE)?.value);
}

export function getAdminLocaleFromServerCookies(): AdminLocale {
  return getAdminLocaleFromApiCookie(cookies().get(ADMIN_LOCALE_COOKIE)?.value);
}

/** Messages utilisateur courts pour les réponses JSON de l’API admin. */
export function adminApiMsgs(locale: AdminLocale) {
  return {
    notAuthenticated: pick(locale, 'Non authentifié', 'Not authenticated'),
    invalidToken: pick(locale, 'Token invalide', 'Invalid token'),
    invalidJson: pick(locale, 'JSON invalide', 'Invalid JSON'),
    opRequired: pick(locale, 'op requis', 'Missing op'),
    serverError: pick(locale, 'Erreur serveur', 'Server error'),
    missingServerConfig: pick(
      locale,
      'Configuration serveur manquante',
      'Server configuration incomplete'
    ),
    invalidCredentials: pick(
      locale,
      'Email ou mot de passe incorrect',
      'Invalid email or password'
    ),
    internalServerError: pick(
      locale,
      'Erreur interne du serveur',
      'Internal server error'
    ),
    noFileProvided: pick(locale, 'Aucun fichier fourni', 'No file provided'),
    invalidFileType: pick(
      locale,
      'Type de fichier invalide (images ou PDF uniquement)',
      'Invalid file type (images or PDF only)'
    ),
    fileTooLargePdf: pick(
      locale,
      'Fichier trop lourd (max 10 Mo)',
      'File too large (max 10 MB)'
    ),
    fileTooLargeImage: pick(
      locale,
      'Fichier trop lourd (max 5 Mo)',
      'File too large (max 5 MB)'
    ),
    uploadSupabasePrefix: pick(locale, 'Erreur Supabase: ', 'Supabase error: '),
    uploadInternalFallback: pick(
      locale,
      'Erreur interne',
      'Internal error'
    ),
  };
}

/** Localise une erreur métier comme « Opération inconnue ». */
export function localizeAdminDataOpMessage(
  locale: AdminLocale,
  message: string
): string {
  const unknownFr = /^Opération inconnue:\s*(.*)$/i.exec(message);
  if (unknownFr) {
    const rest = unknownFr[1]?.trim() ?? '';
    return locale === 'en' ? `Unknown operation: ${rest}` : message;
  }
  return message;
}
