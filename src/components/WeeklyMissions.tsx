import type { Mission } from '@/lib/missions';

/**
 * Painel de missões da semana (só para quem está logado): metas curtas com
 * barra de progresso e recompensa em XP. Presentacional.
 */
export default function WeeklyMissions({ missions }: { missions: Mission[] }) {
  if (missions.length === 0) return null;
  const doneCount = missions.filter((m) => m.done).length;

  return (
    <div
      style={{
        background: '#f7efda',
        border: '1px solid #d8c79d',
        borderRadius: 10,
        boxShadow: '0 2px 0 rgba(0,0,0,.07),0 6px 14px rgba(0,0,0,.14)',
        padding: '14px 16px',
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span style={{ font: '700 11px var(--font-mono)', letterSpacing: '.14em', color: 'rgba(40,30,10,.6)' }}>
          MISSÕES DA SEMANA
        </span>
        <span style={{ font: '600 10px var(--font-mono)', color: doneCount === missions.length ? '#4f8a3a' : 'rgba(40,30,10,.55)' }}>
          {doneCount}/{missions.length} concluídas
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 10 }}>
        {missions.map((m) => {
          const pct = Math.round((m.progress / m.target) * 100);
          return (
            <div
              key={m.id}
              style={{
                background: m.done ? '#eef3dc' : '#efe6cd',
                border: `1px solid ${m.done ? '#b8cf8f' : '#cbb787'}`,
                borderRadius: 8,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ font: '800 12px var(--font-archivo)', color: '#221c12' }}>{m.label}</span>
                <span
                  style={{
                    flex: 'none',
                    font: '800 9px var(--font-mono)',
                    color: m.done ? '#4f8a3a' : '#9a6a1f',
                    background: m.done ? '#dcecbf' : '#f0e2c0',
                    border: `1px solid ${m.done ? '#b8cf8f' : '#d8bf85'}`,
                    borderRadius: 4,
                    padding: '2px 5px',
                  }}
                >
                  {m.done ? '✓ +' : '+'}
                  {m.reward} XP
                </span>
              </div>

              <div
                style={{
                  height: 8,
                  borderRadius: 5,
                  background: '#d6c396',
                  border: '1px solid #b39e6c',
                  overflow: 'hidden',
                  margin: '9px 0 5px',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: m.done ? 'linear-gradient(#7aa05a,#557a38)' : 'linear-gradient(#d9b45c,#b98f2e)',
                  }}
                />
              </div>
              <div style={{ font: '500 9px var(--font-mono)', color: 'rgba(40,30,10,.55)' }}>
                {m.done ? 'concluída' : `${m.progress}/${m.target}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
