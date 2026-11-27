import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        documents: {
          select: { id: true, title: true, type: true, updatedAt: true },
        },
        latexProjects: {
          select: { id: true, title: true, description: true, compiledAt: true, updatedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(folders);
  } catch (error) {
    return handleApiError(error, 'Error fetching folders');
  }
}

export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json();
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const normalizedParentId =
      typeof parentId === 'string' && parentId.trim() ? parentId.trim() : null;

    if (normalizedParentId) {
      const parentExists = await prisma.folder.findUnique({
        where: { id: normalizedParentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        parentId: normalizedParentId,
      },
    });
    return NextResponse.json(folder);
  } catch (error) {
    return handleApiError(error, 'Error creating folder');
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Id required' }, { status: 400 });

    const existing = await prisma.folder.findUnique({
      where: { id },
      select: { id: true, parentId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Re-parent direct subfolders to grandparent (or root) and preserve documents/LaTeX projects
    await prisma.$transaction([
      prisma.folder.updateMany({
        where: { parentId: id },
        data: { parentId: existing.parentId },
      }),
      prisma.document.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      }),
      prisma.latexProject.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      }),
      prisma.folder.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Error deleting folder');
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, parentId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Id required' }, { status: 400 });
    }

    const hasName = name !== undefined;
    const hasParentId = parentId !== undefined;

    if (!hasName && !hasParentId) {
      return NextResponse.json({ error: 'Name or parentId required' }, { status: 400 });
    }

    if (hasName && (typeof name !== 'string' || !name.trim())) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }

    let nextParentId: string | null | undefined = undefined;
    if (hasParentId) {
      nextParentId = typeof parentId === 'string' && parentId.trim() ? parentId.trim() : null;
      if (nextParentId === id) {
        return NextResponse.json(
          { error: 'Una carpeta no puede estar dentro de sí misma' },
          { status: 400 }
        );
      }
      if (nextParentId !== null) {
        const allFolders = await prisma.folder.findMany({
          select: { id: true, parentId: true },
        });
        const parentById = new Map(allFolders.map((f) => [f.id, f.parentId]));
        if (!parentById.has(nextParentId)) {
          return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
        }

        // Walk ancestors of nextParentId to prevent cycles
        let cursor: string | null | undefined = nextParentId;
        const visited = new Set<string>();
        while (cursor && !visited.has(cursor)) {
          if (cursor === id) {
            return NextResponse.json(
              { error: 'No se puede mover una carpeta dentro de una de sus subcarpetas' },
              { status: 400 }
            );
          }
          visited.add(cursor);
          cursor = parentById.get(cursor);
        }
      }
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: {
        ...(hasName ? { name: name.trim() } : {}),
        ...(hasParentId ? { parentId: nextParentId } : {}),
      },
    });
    return NextResponse.json(folder);
  } catch (error) {
    return handleApiError(error, 'Error updating folder');
  }
}
