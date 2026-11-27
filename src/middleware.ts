import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, LEMA_COOKIE_NAME } from '@/lib/auth';

const STATIC_ASSET_REGEX = /\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|mjs|json|wasm|data|woff2?|ttf|eot|map|html|txt|xml)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren contraseña
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/java') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    (!pathname.startsWith('/api/') && STATIC_ASSET_REGEX.test(pathname))
  ) {
    return NextResponse.next();
  }

  // Verificar la cookie de sesión
  const token = request.cookies.get(LEMA_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
