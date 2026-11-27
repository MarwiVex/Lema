import { NextResponse } from 'next/server';
import {
  getGeminiClient,
  GEMINI_MODEL,
  withTimeout,
  generateWithGroqJson,
  cleanJsonResponse,
} from '@/lib/ai';

const SYSTEM_INSTRUCTION_GENERATE = `
Eres un asistente experto en creación de documentos matemáticos estructurados.
Tu tarea es responder a las peticiones del usuario generando un documento en forma de un array de bloques AST (JSON).
Tipos de bloques permitidos:
- "paragraph": { "type": "paragraph", "content": "texto aquí..." }
- "heading": { "type": "heading", "content": "título aquí...", "props": { "level": 1|2|3 } }
- "math_box": { "type": "math_box", "props": { "type": "definition"|"theorem"|"lemma"|"corollary"|"equation", "title": "..." }, "content": "texto aquí..." }
- "codeBlock": { "type": "codeBlock", "content": "código fuente aquí..." }
- "tikz_graph": { "type": "tikz_graph", "content": "\\\\begin{tikzpicture}\\n...\\n\\\\end{tikzpicture}" }

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con un array JSON válido que contenga los bloques. NO incluyas texto fuera del JSON.
2. Puedes decidir libremente qué tipos de bloques crear para cumplir con la petición.
3. Para la notación matemática en "paragraph" y "math_box", usa $...$ para matemáticas inline y $$...$$ para matemáticas en bloque (display math).
4. No envuelvas el JSON con backticks (\`\`\`json). Devuelve directamente el texto JSON.
5. Usa el tono solicitado por el usuario si se especifica.
`;

const SYSTEM_INSTRUCTION_GENERATE_GROQ = SYSTEM_INSTRUCTION_GENERATE.replace(
  'Responde ÚNICAMENTE con un array JSON válido que contenga los bloques.',
  'Responde ÚNICAMENTE con un objeto JSON válido con la forma { "blocks": [...] } donde "blocks" sea el array de bloques.'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_instruction, tone } = body;

    if (typeof user_instruction !== 'string' || !user_instruction.trim()) {
      return NextResponse.json({ error: 'user_instruction es requerido' }, { status: 400 });
    }

    let toneInstruction = '';
    if (tone === 'academic') {
      toneInstruction =
        'TONO REQUERIDO: Académico Riguroso. Aumenta el rigor, usa simbología formal, cuantificadores.';
    } else if (tone === 'intuitive') {
      toneInstruction =
        'TONO REQUERIDO: Explicación Intuitiva. Evita jerga excesivamente técnica, usa analogías.';
    } else if (tone === 'summary') {
      toneInstruction =
        'TONO REQUERIDO: Resumido para Examen. Directo al punto, destaca fórmulas clave.';
    }

    const promptText = `
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
              systemInstruction: SYSTEM_INSTRUCTION_GENERATE,
              responseMimeType: 'application/json',
            },
          }),
          undefined,
          'Gemini Generate'
        );
        resultText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Fallo Gemini API (cuota o error), intentando fallback con Groq:', geminiError.message);
      }
    }

    // Intento 2: Fallback a Groq API si Gemini no devolvió resultado
    if (!resultText && process.env.GROQ_API_KEY) {
      try {
        resultText = await generateWithGroqJson(promptText, SYSTEM_INSTRUCTION_GENERATE_GROQ);
      } catch (groqError: any) {
        console.error('Fallo también el fallback de Groq:', groqError.message);
        throw new Error(`Error en proveedores de IA (Gemini y Groq): ${groqError.message}`);
      }
    }

    if (!resultText) {
      throw new Error('No se pudo obtener respuesta de ningún servicio de IA.');
    }

    let parsedBlocks;
    try {
      const cleanedText = cleanJsonResponse(resultText) || '[]';
      const parsedJson = JSON.parse(cleanedText);
      if (Array.isArray(parsedJson)) {
        parsedBlocks = parsedJson;
      } else if (parsedJson.blocks && Array.isArray(parsedJson.blocks)) {
        parsedBlocks = parsedJson.blocks;
      } else {
        parsedBlocks = [parsedJson];
      }
    } catch {
      console.error('Failed to parse AI generate response as JSON');
      throw new Error('La IA no devolvió un JSON válido.');
    }

    parsedBlocks = parsedBlocks.map((block: any) => {
      if (typeof block.content === 'string') {
        block.content = [{ type: 'text', text: block.content, styles: {} }];
      }
      return block;
    });

    return NextResponse.json({ blocks: parsedBlocks });
  } catch (error: any) {
    console.error('Error en API /api/ai/generate:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
