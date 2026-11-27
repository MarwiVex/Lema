import { prisma } from '@/lib/prisma';
import ClientPage from './ClientPage';
import type { FolderSummary } from '@/lib/types/ast';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // SSR fetch for initial folders to pass to the Dashboard
  const initialFolders = await prisma.folder.findMany({
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

  const serializedFolders: FolderSummary[] = initialFolders.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId ?? null,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    documents: f.documents.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      updatedAt: d.updatedAt.toISOString(),
    })),
    latexProjects: f.latexProjects.map((lp) => ({
      id: lp.id,
      title: lp.title,
      description: lp.description,
      compiledAt: lp.compiledAt ? lp.compiledAt.toISOString() : null,
      updatedAt: lp.updatedAt.toISOString(),
    })),
  }));

  return <ClientPage initialFolders={serializedFolders} />;
}
