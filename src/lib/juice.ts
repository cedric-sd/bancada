// "Juice": micro-interações satisfatórias, sem dependências. Efeitos imperativos
// via Web Animations API, criados e removidos do DOM sob demanda. Respeitam a
// preferência de "reduzir movimento". Só rodam no cliente.

const COLORS = ['#4f8a3a', '#e8c869', '#b23a2a', '#2f6d86', '#d8a93a', '#efe2c2'];

// Marcos de votos que valem celebração (escassez → cada um significa algo).
const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

/**
 * Maior marco cruzado ao passar de `prev` para `next` votos (ou null). Puro e
 * testável — a base para disparar confete só quando um marco é batido.
 */
export function crossedMilestone(prev: number, next: number): number | null {
  if (next <= prev) return null;
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    const m = MILESTONES[i];
    if (prev < m && next >= m) return m;
  }
  return null;
}

function reduceMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function make(style: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: '9999',
    willChange: 'transform, opacity',
    ...style,
  });
  document.body.appendChild(el);
  return el;
}

/** Estouro curto de faíscas subindo a partir de um ponto — resposta ao voto. */
export function sparkAt(x: number, y: number, count = 12): void {
  if (typeof document === 'undefined' || reduceMotion()) return;
  for (let i = 0; i < count; i++) {
    const size = 5 + Math.random() * 4;
    const el = make({
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '2px',
      background: COLORS[i % COLORS.length],
    });
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3; // para cima, espalhando
    const dist = 26 + Math.random() * 46;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 360;
    const anim = el.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0) scale(1)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(.5)`,
          opacity: 0,
        },
      ],
      { duration: 480 + Math.random() * 260, easing: 'cubic-bezier(.2,.7,.3,1)' },
    );
    anim.onfinish = () => el.remove();
  }
}

/** Chuva de confete a partir do topo — celebração de marco. */
export function confettiBurst(count = 90): void {
  if (typeof document === 'undefined' || reduceMotion()) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < count; i++) {
    const size = 6 + Math.random() * 6;
    const startX = w * 0.5 + (Math.random() - 0.5) * w * 0.7;
    const el = make({
      left: `${startX}px`,
      top: '-24px',
      width: `${size}px`,
      height: `${size * 0.62}px`,
      background: COLORS[i % COLORS.length],
      borderRadius: '1px',
    });
    const dx = (Math.random() - 0.5) * 240;
    const rot = Math.random() * 720 + 360;
    const anim = el.animate(
      [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${h * 0.85}px) rotate(${rot * 0.8}deg)`, opacity: 1, offset: 0.85 },
        { transform: `translate(${dx}px, ${h + 60}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1700 + Math.random() * 1000, easing: 'cubic-bezier(.25,.6,.4,1)' },
    );
    anim.onfinish = () => el.remove();
  }
}
