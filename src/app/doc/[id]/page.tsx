import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DocEditorClient from '@/components/editor/DocEditorClient';
import { PartialBlock } from '@blocknote/core';

export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      folderId: true,
    },
  });

  if (!doc) {
    notFound();
  }

  let initialContent: PartialBlock[] = [{ type: 'paragraph', content: '' }];
  
  if (doc.content) {
    try {
      const parsed = JSON.parse(doc.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialContent = parsed;
      }
    } catch {
      // Keep empty paragraph
    }
  }

  return (
    <DocEditorClient
      documentId={doc.id}
      title={doc.title}
      folderId={doc.folderId}
      initialContent={initialContent}
    />
  );
}
