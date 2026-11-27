import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WhiteboardClient from '@/components/editor/WhiteboardClient';
import { PartialBlock } from '@blocknote/core';

export default async function WhiteboardPage({
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
      whiteboardData: true,
      folderId: true,
    },
  });

  if (!doc) {
    notFound();
  }

  let initialContent: PartialBlock[] | undefined = undefined;
  
  if (doc.content) {
    try {
      const parsed = JSON.parse(doc.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialContent = parsed;
      }
    } catch {
      // Leave undefined to show the 'scan content will appear here' placeholder
    }
  }

  return (
    <WhiteboardClient
      documentId={doc.id}
      title={doc.title}
      initialWhiteboardData={doc.whiteboardData}
      initialContent={initialContent}
    />
  );
}
