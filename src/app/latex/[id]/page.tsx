import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LatexProjectClient from '@/components/editor/LatexProjectClient';
import { type LatexProjectData } from '@/components/editor/LatexProjectViewer';

export default async function LatexProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch project metadata and files WITHOUT pdfBase64 so SSR/RSC payload stays tiny
  const project = await prisma.latexProject.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      compiledAt: true,
      files: {
        orderBy: [{ isMain: 'desc' }, { filename: 'asc' }],
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Ensure it matches LatexProjectData (PDF will be streamed from /api/latex-projects/[id]/pdf)
  const projectData: LatexProjectData = {
    id: project.id,
    title: project.title,
    description: project.description,
    hasPdf: Boolean(project.compiledAt),
    compiledAt: project.compiledAt?.toISOString() ?? null,
    files: project.files.map((f) => ({
      id: f.id,
      filename: f.filename,
      content: f.content,
      isBinary: f.isBinary,
      isMain: f.isMain,
    })),
  };

  return <LatexProjectClient initialProject={projectData} />;
}
