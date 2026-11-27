import { NextResponse } from 'next/server';

export function handleApiError(error: unknown, fallbackMessage: string) {
  const err = error as { code?: string; message?: string } | null;

  if (err?.code === 'P2025') {
    return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
  }
  if (err?.code === 'P2003') {
    return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 });
  }
  if (err?.code === 'P2002') {
    return NextResponse.json({ error: 'Registro duplicado' }, { status: 409 });
  }

  console.error(`[API Error] ${fallbackMessage}:`, error);
  const message =
    process.env.NODE_ENV === 'production'
      ? fallbackMessage
      : err?.message || fallbackMessage;

  return NextResponse.json({ error: message }, { status: 500 });
}
