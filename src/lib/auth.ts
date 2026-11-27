export const LEMA_COOKIE_NAME = 'lema_session';

let cachedSecret: string | null = null;
let cachedKeyPromise: Promise<CryptoKey> | null = null;

async function getSecretKey(): Promise<CryptoKey> {
  const envSecret = process.env.LEMA_SESSION_SECRET || process.env.LEMA_APP_PASSWORD;
  if (!envSecret && process.env.NODE_ENV === 'production') {
    throw new Error('Missing LEMA_SESSION_SECRET or LEMA_APP_PASSWORD in production');
  }
  const secret = envSecret || 'lema_default_secret_key_2026';

  if (cachedKeyPromise && cachedSecret === secret) {
    return cachedKeyPromise;
  }

  cachedSecret = secret;
  const encoder = new TextEncoder();
  cachedKeyPromise = crypto.subtle
    .importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
    .catch((err) => {
      cachedKeyPromise = null;
      cachedSecret = null;
      throw err;
    });

  return cachedKeyPromise;
}

export async function createSessionToken(): Promise<string> {
  const key = await getSecretKey();
  const payload = JSON.stringify({ auth: true, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const b64Payload = btoa(payload);
  return `${b64Payload}.${sigHex}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [b64Payload, sigHex] = parts;
    if (!b64Payload || !sigHex || sigHex.length % 2 !== 0) return false;

    const payloadStr = atob(b64Payload);
    const key = await getSecretKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadStr);

    const match = sigHex.match(/.{2}/g);
    if (!match || match.length * 2 !== sigHex.length) return false;
    const sigArray = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
    if (sigArray.some((b) => Number.isNaN(b))) return false;

    const isValid = await crypto.subtle.verify('HMAC', key, sigArray, data);
    if (!isValid) return false;

    const payload = JSON.parse(payloadStr);
    if (!payload || payload.auth !== true || typeof payload.exp !== 'number') return false;
    if (payload.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}
