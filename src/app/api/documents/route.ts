import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const title = searchParams.get('title');

    if (id) {
      const ifNoneMatch = req.headers.get('if-none-match');
      if (ifNoneMatch) {
        const meta = await prisma.document.findUnique({
          where: { id },
          select: { id: true, updatedAt: true },
        });
        if (!meta) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const etag = `"${meta.id}-${meta.updatedAt.getTime()}"`;
        if (ifNoneMatch === etag) {
          return new NextResponse(null, {
            status: 304,
            headers: {
              ETag: etag,
              'Cache-Control': 'private, must-revalidate',
            },
          });
        }
      }

      const document = await prisma.document.findUnique({
        where: { id },
      });
      if (!document) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const etag = `"${document.id}-${document.updatedAt.getTime()}"`;
      return NextResponse.json(document, {
        headers: {
          ETag: etag,
          'Cache-Control': 'private, must-revalidate',
        },
      });
    }

    if (title !== null) {
      const normalized = normalizeTitle(title);
      if (!normalized) {
        return NextResponse.json({ error: 'Title required' }, { status: 400 });
      }
      const match = await prisma.document.findFirst({
        where: { normalizedTitle: normalized },
        select: { id: true, title: true, type: true },
      });
      if (!match) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(match);
    }

    const q = searchParams.get('q');
    if (q !== null) {
      const normalizedQuery = normalizeTitle(q);
      const docs = await prisma.document.findMany({
        where: normalizedQuery
          ? { normalizedTitle: { contains: normalizedQuery } }
          : undefined,
        select: {
          id: true,
          title: true,
          type: true,
          folderId: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });
      return NextResponse.json(docs);
    }

    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        folderId: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return handleApiError(error, 'Error fetching documents');
  }
}

function extractLinks(content: string) {
  const links = new Set<string>();
  // 1. Detectar sintaxis wikilink en texto plano: [[Nombre de Nota]]
  const bracketRegex = /\[\[(.*?)\]\]/g;
  let match;
  while ((match = bracketRegex.exec(content)) !== null) {
    if (match[1]?.trim()) {
      links.add(match[1].trim());
    }
  }

  // 2. Detectar bloques inline wiki_link en el AST JSON de BlockNote
  try {
    const parsed = JSON.parse(content);
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (const item of node) walk(item);
        return;
      }
      if (node.type === 'wiki_link' && typeof node.props?.note === 'string' && node.props.note.trim()) {
        links.add(node.props.note.trim());
      }
      if (node.content) walk(node.content);
      if (node.children) walk(node.children);
    };
    walk(parsed);
  } catch {
    // Fallback regex si content no es JSON válido
  }

  return Array.from(links);
}

async function findIncomingLinkSourceIds(
  targetNormalizedTitle: string,
  excludeId?: string
): Promise<string[]> {
  if (!targetNormalizedTitle) return [];
  const allDocs = await prisma.document.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, content: true },
  });
  const matchedIds: string[] = [];
  for (const doc of allDocs) {
    const links = extractLinks(doc.content);
    if (links.some((l) => normalizeTitle(l) === targetNormalizedTitle)) {
      matchedIds.push(doc.id);
    }
  }
  return matchedIds;
}

export async function POST(req: Request) {
  try {
    const { title, content, type, whiteboardData, folderId } = await req.json();
    if (!title || content === undefined) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const normalizedTitle = normalizeTitle(title);
    const linkNames = Array.from(
      new Set(extractLinks(content).map(normalizeTitle).filter((n) => n && n !== normalizedTitle))
    );

    const [linkedDocs, incomingIds] = await Promise.all([
      linkNames.length > 0
        ? prisma.document.findMany({
            where: { normalizedTitle: { in: linkNames } },
            select: { id: true },
          })
        : Promise.resolve([]),
      findIncomingLinkSourceIds(normalizedTitle),
    ]);

    const document = await prisma.document.create({
      data: {
        title,
        normalizedTitle,
        type: type || 'TEXT',
        content,
        whiteboardData: whiteboardData || null,
        folderId: folderId || null,
        links: {
          connect: linkedDocs.map((d: { id: string }) => ({ id: d.id })),
        },
        linkedFrom: {
          connect: incomingIds.map((srcId) => ({ id: srcId })),
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        folderId: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(document);
  } catch (error) {
    return handleApiError(error, 'Error creating document');
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 });

    await prisma.document.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Error deleting document');
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, content, type, whiteboardData, folderId } = await req.json();
    if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 });

    const normalizedLinkNames =
      content !== undefined
        ? Array.from(new Set(extractLinks(content).map(normalizeTitle).filter(Boolean)))
        : null;
    const nextNormalizedTitle = title !== undefined ? normalizeTitle(title) : undefined;

    const [linkedDocs, incomingIds] = await Promise.all([
      normalizedLinkNames && normalizedLinkNames.length > 0
        ? prisma.document.findMany({
            where: { normalizedTitle: { in: normalizedLinkNames }, id: { not: id } },
            select: { id: true },
          })
        : Promise.resolve([]),
      nextNormalizedTitle !== undefined
        ? findIncomingLinkSourceIds(nextNormalizedTitle, id)
        : Promise.resolve(null),
    ]);

    const linkUpdate =
      normalizedLinkNames !== null
        ? {
            links: {
              set: linkedDocs.map((d: { id: string }) => ({ id: d.id })),
            },
          }
        : {};

    const linkedFromUpdate =
      incomingIds !== null
        ? {
            linkedFrom: {
              set: incomingIds.map((srcId) => ({ id: srcId })),
            },
          }
        : {};

    const document = await prisma.document.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        normalizedTitle: nextNormalizedTitle,
        type: type !== undefined ? type : undefined,
        content: content !== undefined ? content : undefined,
        whiteboardData: whiteboardData !== undefined ? whiteboardData : undefined,
        folderId: folderId !== undefined ? folderId : undefined,
        ...linkUpdate,
        ...linkedFromUpdate,
      },
      select: {
        id: true,
        title: true,
        type: true,
        folderId: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(document);
  } catch (error) {
    return handleApiError(error, 'Error updating document');
  }
}
