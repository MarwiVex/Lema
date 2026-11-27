import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
export const AI_TIMEOUT_MS = 35_000;
export const MAX_IMAGE_BASE64_LENGTH = 14_000_000; // ~10 MB binary

let cachedApiKey: string | undefined;
let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = AI_TIMEOUT_MS,
  label: string = 'IA'
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout al esperar respuesta de ${label} (${Math.round(ms / 1000)}s)`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function generateWithGroqJson(
  promptText: string,
  systemInstruction: string,
  timeoutMs: number = 30_000
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error('No Groq API Key configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: promptText },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API Error: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

export function cleanJsonResponse(raw: string): string {
  let cleaned = (raw || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/i, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

export function extractBalancedJson(
  raw: string,
  openChar: '[' | '{',
  closeChar: ']' | '}'
): string | null {
  const start = raw.indexOf(openChar);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === openChar) {
      depth += 1;
    } else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}

export function extractJsonArray(raw: string): string {
  const cleaned = cleanJsonResponse(raw);
  return extractBalancedJson(cleaned, '[', ']') ?? cleaned;
}

export function extractJsonObject(raw: string): string {
  const cleaned = cleanJsonResponse(raw);
  return extractBalancedJson(cleaned, '{', '}') ?? cleaned;
}
