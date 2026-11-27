import { NextResponse } from 'next/server';
import { compileLatexWithTectonic } from '@/lib/tectonic';

export async function POST(req: Request) {
  try {
    const { latexCode } = await req.json();

    if (!latexCode || typeof latexCode !== 'string') {
      return NextResponse.json({ error: 'latexCode es requerido' }, { status: 400 });
    }

    const result = await compileLatexWithTectonic({
      files: [{ filename: 'document.tex', content: latexCode, isBinary: false }],
      mainFilename: 'document.tex',
      allowDocker: true,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      );
    }

    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cheatsheet.pdf"',
      },
    });
  } catch (error: any) {
    console.error('[/api/compile] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error?.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
