import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  adminApiMsgs,
  getAdminLocaleFromServerCookies,
} from '@/lib/admin-api-i18n';

export async function POST(req: NextRequest) {
  const msgs = adminApiMsgs(getAdminLocaleFromServerCookies());
  // Vérifier l'auth
  const token = cookies().get(JWT_COOKIE)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: msgs.notAuthenticated }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'portfolio';
    const path = (formData.get('path') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: msgs.noFileProvided }, { status: 400 });
    }

    // Validation type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: msgs.invalidFileType }, { status: 400 });
    }

    // Validation taille (10 Mo max pour PDF, 5 Mo pour images)
    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMsg =
        file.type === 'application/pdf'
          ? msgs.fileTooLargePdf
          : msgs.fileTooLargeImage;
      return NextResponse.json({ error: sizeMsg }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via le client admin (service_role → bypass RLS + Storage policies)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `${msgs.uploadSupabasePrefix}${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err.message ?? msgs.uploadInternalFallback },
      { status: 500 }
    );
  }
}
