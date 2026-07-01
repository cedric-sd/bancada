import Link from 'next/link';
import Board from '@/components/Board';
import ProjectForm from '@/components/ProjectForm';

export default function PublicarPage() {
  return (
    <Board maxWidth={740}>
      <Link
        href="/"
        style={{ font: '500 10px var(--font-mono)', color: 'rgba(40,30,10,.6)', display: 'inline-block', marginBottom: 14 }}
      >
        ‹ voltar ao placar
      </Link>
      <ProjectForm mode="create" />
    </Board>
  );
}
