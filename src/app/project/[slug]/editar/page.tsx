import Link from 'next/link';
import { notFound } from 'next/navigation';
import Board from '@/components/Board';
import ProjectForm from '@/components/ProjectForm';
import { getProjectBySlug } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <Board maxWidth={740}>
      <Link
        href={`/project/${slug}`}
        style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', display: 'inline-block', marginBottom: 14 }}
      >
        ‹ voltar ao projeto
      </Link>
      <ProjectForm
        mode="edit"
        slug={slug}
        initial={{
          name: project.name,
          author: project.author,
          handle: project.handle,
          cat: project.cat,
          blurb: project.blurb,
          description: project.description,
          tags: project.tags.join(', '),
          stars: project.stars,
        }}
      />
    </Board>
  );
}
