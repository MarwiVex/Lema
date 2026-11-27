import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Metadata-only lookup first so 304 avoids transferring multi-MB pdfBase64 from Turso
    const meta = await prisma.latexProject.findUnique({
      where: { id },
      select: { id: true, title: true, compiledAt: true },
    });

    if (!meta) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const etag = meta.compiledAt
      ? `"${meta.id}-${meta.compiledAt.getTime()}"`
      : null;

    if (etag && req.headers.get('if-none-match') === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'private, must-revalidate',
          'Cross-Origin-Resource-Policy': 'same-origin',
        },
      });
    }

    // 2. Fetch pdfBase64 only on cache miss
    const project = await prisma.latexProject.findUnique({
      where: { id },
      select: { pdfBase64: true, title: true, compiledAt: true },
    });

    if (!project?.pdfBase64) {
      return NextResponse.json({ error: 'PDF no disponible' }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(project.pdfBase64, 'base64');
    const url = new URL(req.url);
    const isDownload = url.searchParams.get('download') === '1';
    const safeTitle =
      (project.title || 'documento').replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() ||
      'documento';
    const asciiFallback =
      safeTitle.replace(/[^a-z0-9_\- ]/gi, '_').trim() || 'documento';

    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdfBuffer.length),
      'Cache-Control': 'private, must-revalidate',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodeURIComponent(safeTitle)}.pdf`,
    };

    if (etag) {
      headers.ETag = etag;
    } else if (project.compiledAt) {
      headers.ETag = `"${meta.id}-${project.compiledAt.getTime()}"`;
    }

    return new NextResponse(pdfBuffer, { status: 200, headers });
  } catch (error) {
    return handleApiError(error, 'Error serving LaTeX project PDF');
  }
}
