import { describeNotification, type Notification } from './notifications';

function make(over: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    kind: 'vote',
    projectSlug: 'lumen',
    projectName: 'Lumen',
    actor: 'Théo Salles',
    meta: {},
    read: false,
    createdAt: '2024-06-24 10:00:00',
    ...over,
  };
}

describe('describeNotification', () => {
  it('voto: ícone ▲, texto e link para o projeto', () => {
    const v = describeNotification(make());
    expect(v.icon).toBe('▲');
    expect(v.title).toBe('Théo Salles votou em Lumen');
    expect(v.href).toBe('/project/lumen');
  });

  it('review: ícone ★ com as estrelas e a nota', () => {
    const v = describeNotification(make({ kind: 'review', meta: { stars: 5 } }));
    expect(v.icon).toBe('★');
    expect(v.title).toBe('Théo Salles avaliou Lumen — ★★★★★ 5/5');
    expect(v.href).toBe('/project/lumen');
  });

  it('follow: ícone ➕, texto e link para o perfil de quem seguiu', () => {
    const v = describeNotification(
      make({ kind: 'follow', projectSlug: null, projectName: null, meta: { handle: 'theosalles' } }),
    );
    expect(v.icon).toBe('➕');
    expect(v.title).toBe('Théo Salles começou a seguir você');
    expect(v.href).toBe('/dev/theosalles');
  });

  it('cai em textos genéricos quando faltam autor/projeto', () => {
    const v = describeNotification(make({ actor: null, projectName: null, projectSlug: null }));
    expect(v.title).toBe('Alguém votou em seu projeto');
    expect(v.href).toBeNull();
  });

  it('review sem estrelas não quebra', () => {
    const v = describeNotification(make({ kind: 'review', meta: {} }));
    expect(v.title).toBe('Théo Salles avaliou Lumen — 0/5');
  });
});
