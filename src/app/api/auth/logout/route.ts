import { NextResponse } from 'next/server';
import { LEMA_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(LEMA_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
