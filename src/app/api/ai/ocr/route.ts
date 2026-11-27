import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getCachedOcrBlocks, setCachedOcrBlocks } from '@/lib/ocrCache';
import {
  getGeminiClient,
  GEMINI_MODEL,
  MAX_IMAGE_BASE64_LENGTH,
  withTimeout,
  extractJsonArray,
} from '@/lib/ai';

const SYSTEM_INSTRUCTION_OCR = `
Eres un experto transcriptor de matemáticas avanzadas, ciencia de la computación y código LaTeX.
Tu tarea es analizar la imagen/escaneo adjunto de apuntes o documentos y convertirlo ESTRICTAMENTE en un array JSON de bloques compatible con el editor BlockNote.

REGLAS DE SALIDA:
1. Responde ÚNICAMENTE con un array JSON válido. Sin explicaciones ni bloques de código markdown.
2. Convierte todas las ecuaciones matemáticas a sintaxis LaTeX estándar. Usa $...$ para inline y $$...$$ para display.
3. Tipos de bloque disponibles: "paragraph", "heading", "math_box".
   - "heading" tiene props: { "level": 1 | 2 | 3 }
   - "math_box" tiene props: { "type": "definition" | "theorem" | "lemma" | "corollary", "title": "..." }
4. CRÍTICO: El campo "content" de cada bloque debe ser un ARRAY de objetos InlineContent, NO una cadena de texto.
   Formato correcto de InlineContent: { "type": "text", "text": "el texto aquí con $LaTeX$ inline", "styles": {} }
5. NO incluyas el campo "id" en ningún bloque. El editor lo asigna automáticamente.
6. DIBUJOS A TIKZ: Si en la imagen detectas un diagrama, gráfico o esquema y se indica "Convertir Dibujo a TikZ" (o intención similar), genera el código LaTeX utilizando el entorno \\begin{tikzpicture}...\\end{tikzpicture} correspondiente para recrear el diagrama de forma precisa. Coloca el código LaTeX generado dentro del texto de un bloque "paragraph". ¡Importante! Asegúrate de escapar correctamente las diagonales inversas en JSON (ej. \\\\begin{tikzpicture}).

Ejemplo de salida correcta:
[
  {
    "type": "heading",
    "props": { "level": 2 },
    "content": [{ "type": "text", "text": "Espacios Métricos", "styles": {} }]
  },
  {
    "type": "math_box",
    "props": { "type": "definition", "title": "Definición: Métrica" },
    "content": [{ "type": "text", "text": "Sea $X$ un conjunto y $d: X \\times X \\to \\mathbb{R}$ una métrica si: $d(x,y) \\geq 0$.", "styles": {} }]
  },
  {
    "type": "paragraph",
    "content": [{ "type": "text", "text": "Texto normal con $f(x) = x^2$ inline.\\n\\n\\\\begin{tikzpicture}\\n\\\\draw (0,0) -- (1,0) -- (0,1) -- cycle;\\n\\\\end{tikzpicture}", "styles": {} }]
  }
]
`;

function normalizeBlocks(rawBlocks: any[]): any[] {
  return rawBlocks.map((block: any) => {
    const { id, ...rest } = block;
    if (typeof rest.content === 'string') {
      rest.content = [{ type: 'text', text: rest.content, styles: {} }];
    }
    return rest;
  });
}

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Falta la imagen base64' }, { status: 400 });
    }

    const cleanImageBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    if (cleanImageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'La imagen excede el tamaño máximo permitido (10 MB).' },
        { status: 413 }
      );
    }

    // ── Caché: calcular SHA-256 con prefijo 'ocr:' para evitar colisiones con TikZ ──
    const imageHash = createHash('sha256').update('ocr:' + cleanImageBase64).digest('hex');

    const cached = await getCachedOcrBlocks(imageHash);
    if (cached) {
      return NextResponse.json(cached);
    }

    const ai = getGeminiClient();

    if (!ai) {
      return NextResponse.json([
        {
          type: 'math_box',
          props: { type: 'theorem', title: 'Teorema de Mock' },
          content: [
            {
              type: 'text',
              text: 'Sea $V$ un espacio vectorial. Este es un bloque mock generado sin API Key.',
              styles: {},
            },
          ],
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
                  data: cleanImageBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: 'Extrae todo el texto y las matemáticas de esta imagen y conviértelos al esquema de bloques JSON especificado en las instrucciones del sistema.',
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_OCR,
          responseMimeType: 'application/json',
        },
      }),
      undefined,
      'Gemini OCR'
    );

    const resultText = response.text;

    let blocksArray: any[] = [];
    try {
      const cleanedText = extractJsonArray(resultText || '[]');
      const parsed = JSON.parse(cleanedText);
      if (!Array.isArray(parsed)) {
        throw new Error('Se esperaba un arreglo JSON');
      }
      blocksArray = parsed;
    } catch {
      console.error('Failed to parse OCR response as JSON');
      throw new Error('Respuesta inválida de IA — no se pudo parsear el JSON');
    }

    blocksArray = normalizeBlocks(blocksArray);

    await setCachedOcrBlocks(imageHash, blocksArray);

    return NextResponse.json(blocksArray);
  } catch (error: any) {
    console.error('Error en API /api/ai/ocr:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
