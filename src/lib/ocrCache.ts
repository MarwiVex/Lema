import { prisma } from '@/lib/prisma';

const OCR_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export async function getCachedOcrBlocks(imageHash: string): Promise<unknown[] | null> {
  try {
    const cached = await prisma.ocrCache.findUnique({ where: { imageHash } });
    if (!cached) return null;

    const ageMs = Date.now() - new Date(cached.createdAt).getTime();
    if (ageMs > OCR_CACHE_TTL_MS) {
      await prisma.ocrCache.delete({ where: { imageHash } }).catch(() => {});
      return null;
    }

    const parsed = JSON.parse(cached.blocksJson);
    if (!Array.isArray(parsed)) {
      await prisma.ocrCache.delete({ where: { imageHash } }).catch(() => {});
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedOcrBlocks(
  imageHash: string,
  blocks: unknown[]
): Promise<void> {
  try {
    const blocksJson = JSON.stringify(blocks);
    await prisma.ocrCache.upsert({
      where: { imageHash },
      update: { blocksJson, createdAt: new Date() },
      create: { imageHash, blocksJson },
    });

    // Opportunistic non-blocking cleanup of expired entries
    const cutoff = new Date(Date.now() - OCR_CACHE_TTL_MS);
    void prisma.ocrCache
      .deleteMany({ where: { createdAt: { lt: cutoff } } })
      .catch(() => {});
  } catch (err) {
    console.warn('[OcrCache] Failed to save cache:', err);
  }
}
