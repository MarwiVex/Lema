import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getCachedOcrBlocks, setCachedOcrBlocks } from '@/lib/ocrCache';
import {
  getGeminiClient,
  GEMINI_MODEL,
  MAX_IMAGE_BASE64_LENGTH,
  withTimeout,
  cleanJsonResponse,
} from '@/lib/ai';

const SYSTEM_INSTRUCTION_TIKZ = `
Eres un experto en LaTeX y TikZ.
Tu tarea es analizar la imagen del boceto/diagrama y generar el código TikZ/LaTeX correspondiente para recrearlo fielmente.

REGLAS DE SALIDA:
1. Responde ÚNICAMENTE con un array JSON válido, sin explicaciones ni formato markdown extra.
2. El array JSON debe contener un solo bloque de tipo "paragraph" que incluya el código TikZ generado.
3. El código LaTeX debe estar envuelto en el entorno correspondiente (ej. \\begin{tikzpicture}...\\end{tikzpicture}).
4. CRÍTICO: Asegúrate de escapar correctamente las diagonales inversas en JSON (ej. \\\\begin{tikzpicture}).
5. El campo "content" del bloque debe ser un array de objetos InlineContent: [{ "type": "text", "text": "...", "styles": {} }]

Ejemplo de salida:
[
  {
    "type": "paragraph",
    "content": [{ "type": "text", "text": "\\\\begin{tikzpicture}\\n\\\\draw (0,0) -- (1,0) -- (0,1) -- cycle;\\n\\\\end{tikzpicture}", "styles": {} }]
  }
]
`;

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Falta la imagen base64' }, { status: 400 });
    }

    if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'La imagen excede el tamaño máximo permitido (10 MB).' },
        { status: 413 }
      );
    }

    const imageHash = createHash('sha256').update('tikz:' + imageBase64).digest('hex');

    const cached = await getCachedOcrBlocks(imageHash);
    if (cached) {
      return NextResponse.json(cached);
    }

    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json([
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '\\begin{tikzpicture}\n\\draw (0,0) circle (1);\n\\end{tikzpicture}', styles: {} }],
        },
      ]);
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: 'Genera el código TikZ para este diagrama. Sigue estrictamente el formato JSON.',
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_TIKZ,
          responseMimeType: 'application/json',
        },
      }),
      undefined,
      'Gemini TikZ'
    );

    const resultText = response.text;

    let blocksArray: any[] = [];
    try {
      let cleanedText = cleanJsonResponse(resultText || '[]');
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      blocksArray = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse TikZ response as JSON');
      throw new Error('Respuesta inválida de IA — no se pudo parsear el JSON');
    }

    blocksArray = blocksArray.map((block: any) => {
      const { id, ...rest } = block;
      if (typeof rest.content === 'string') {
        rest.content = [{ type: 'text', text: rest.content, styles: {} }];
      }
      return rest;
    });

    await setCachedOcrBlocks(imageHash, blocksArray);

    return NextResponse.json(blocksArray);
  } catch (error: any) {
    console.error('Error en API /api/ai/tikz:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
