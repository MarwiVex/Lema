import { NextResponse } from 'next/server';
import {
  getGeminiClient,
  GEMINI_MODEL,
  withTimeout,
  generateWithGroqJson,
  extractJsonObject,
} from '@/lib/ai';

const SYSTEM_INSTRUCTION_DELTA = `
Eres un asistente especializado en edición incremental de documentos matemáticos estructurados por bloques.
Recibirás el bloque objetivo en formato JSON y una instrucción de modificación del usuario.

REGLAS ESTRICTAS:
1. NO regeneres el documento completo. Genera ÚNICAMENTE la actualización en formato JSON Patch para el bloque objetivo.
2. En BlockNote, el texto principal del bloque vive en la propiedad "content" como un ARRAY de objetos de texto (InlineContent).
   Formato correcto de un objeto de texto simple: { "type": "text", "text": "texto aquí", "styles": {} }
   Para actualizar texto con LaTeX, usa delimitadores $...$ para inline y $$...$$ para display.
   Ejemplo de patch válido:
   {
     "action": "UPDATE_BLOCK",
     "target_block_id": "...",
     "patch": {
       "content": [{ "type": "text", "text": "La energía es $E=mc^2$ y el espacio se curva.", "styles": {} }]
     }
   }
3. Si el bloque es de tipo math_box, puedes actualizar "props" (type, title) junto con "content".
4. Asegura que cualquier sintaxis LaTeX esté limpia y lista para renderizado KaTeX.
5. Responde EXCLUSIVAMENTE con el JSON Delta especificado. NINGÚN OTRO TEXTO ni bloques de markdown.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target_block, user_instruction, tone } = body;

    if (!target_block || typeof target_block !== 'object' || typeof user_instruction !== 'string' || !user_instruction.trim()) {
      return NextResponse.json(
        { error: 'target_block y user_instruction son requeridos' },
        { status: 400 }
      );
    }

    let toneInstruction = '';
    if (tone === 'academic') {
      toneInstruction =
        'TONO REQUERIDO: Académico Riguroso. Intenta aumentar ligeramente el rigor. Siempre trata de usar simbología adecuada en lugar de usar el texto que represente esta, usar más los cuantificadores y considera usar un poco el := o el congruente a si aplica, si no usar el = convencional. No exagerar en esto.';
    } else if (tone === 'intuitive') {
      toneInstruction =
        'TONO REQUERIDO: Explicación Intuitiva. Evita la jerga excesivamente técnica cuando sea posible. Usa analogías o explicaciones paso a paso fáciles de entender.';
    } else if (tone === 'summary') {
      toneInstruction =
        'TONO REQUERIDO: Resumido para Examen. Ve directo al punto, omite los detalles innecesarios y destaca fórmulas o definiciones clave memorizables.';
    }

    const promptText = `
    BLOQUE OBJETIVO ACTUAL:
    ${JSON.stringify(target_block, null, 2)}

    INSTRUCCIÓN DEL USUARIO:
    "${user_instruction}"

    ${toneInstruction}
    `;

    let resultText = '';

    // Intento 1: Gemini API
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: promptText,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION_DELTA,
              responseMimeType: 'application/json',
            },
          }),
          undefined,
          'Gemini Delta'
        );
        resultText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Fallo Gemini API (cuota o error), intentando fallback con Groq:', geminiError.message);
      }
    }

    // Intento 2: Fallback a Groq API si Gemini no devolvió resultado
    if (!resultText && process.env.GROQ_API_KEY) {
      try {
        resultText = await generateWithGroqJson(promptText, SYSTEM_INSTRUCTION_DELTA);
      } catch (groqError: any) {
        console.error('Fallo también el fallback de Groq:', groqError.message);
        throw new Error(`Error en proveedores de IA (Gemini y Groq): ${groqError.message}`);
      }
    }

    if (!resultText) {
      throw new Error('No se pudo obtener respuesta de ningún servicio de IA.');
    }

    let jsonPatch;
    try {
      const cleanedText = extractJsonObject(resultText) || '{}';
      jsonPatch = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse AI response as JSON');
      jsonPatch = {
        action: 'UPDATE_BLOCK',
        target_block_id: target_block?.id ?? null,
        patch: {
          content: '\n\n[Respuesta IA]: ' + resultText,
        },
      };
    }

    if (jsonPatch?.patch?.content && typeof jsonPatch.patch.content === 'string') {
      const text = jsonPatch.patch.content;
      jsonPatch.patch.content = [{ type: 'text', text, styles: {} }];
    }

    return NextResponse.json(jsonPatch);
  } catch (error: any) {
    console.error('Error en API /api/ai/delta:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
