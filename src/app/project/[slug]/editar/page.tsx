import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Board from '@/components/Board';
import ProjectForm from '@/components/ProjectForm';
import { getProjectBySlug } from '@/lib/projects';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(`/project/${slug}/editar`)}`);
  // Só o dono edita.
  if (project.ownerId !== user.id) redirect(`/project/${slug}`);

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
        hasImage={project.hasImage}
        initial={{
          name: project.name,
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
