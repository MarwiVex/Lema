import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSessionToken, LEMA_COOKIE_NAME } from '@/lib/auth';

function safeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const envPassword = process.env.LEMA_APP_PASSWORD;

    if (!envPassword && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Autenticación no configurada' }, { status: 500 });
    }

    const expectedPassword = envPassword || 'lema2026';

    if (typeof password !== 'string' || !password || !safeCompareStrings(password, expectedPassword)) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: LEMA_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 días
    });

    return response;
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
