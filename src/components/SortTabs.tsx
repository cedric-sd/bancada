import Link from 'next/link';
import type { SortKey } from '@/lib/projects';

const TABS: { key: SortKey; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'novos', label: 'Novos' },
  { key: 'alta', label: 'Em alta' },
];

/**
 * Controle segmentado de ordenação do placar (Top / Novos / Em alta),
 * no estilo físico do protótipo.
 */
export default function SortTabs({ active }: { active: SortKey }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#cdb486',
        border: '1px solid #a98f5f',
        borderRadius: 9,
        padding: 3,
        gap: 2,
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3),0 1px 0 rgba(255,255,255,.25)',
      }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.key === 'top' ? '/' : `/?ordem=${t.key}`}
            scroll={false}
            style={{
              font: '700 11px/1 var(--font-mono)',
              padding: '7px 13px',
              borderRadius: 6,
              color: on ? '#2a2419' : 'rgba(40,30,10,.55)',
              background: on ? 'linear-gradient(#f6efdc,#e6d6b0)' : 'transparent',
              boxShadow: on ? '0 1px 0 rgba(0,0,0,.18)' : 'none',
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
