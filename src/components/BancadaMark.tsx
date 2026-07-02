/**
 * Marca da Bancada: um "chip" gravado com um pódio (placar) e o ▲ de upvote
 * dourado no topo do 1º lugar — o gesto central da plataforma (votar/ranquear).
 */
export default function BancadaMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Bancada"
      style={{ display: 'block', flex: 'none', filter: 'drop-shadow(0 3px 0 rgba(0,0,0,.32))' }}
    >
      <defs>
        <linearGradient id="bc-chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#312a1b" />
          <stop offset="1" stopColor="#16120c" />
        </linearGradient>
        <linearGradient id="bc-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4d98a" />
          <stop offset="1" stopColor="#d8a93a" />
        </linearGradient>
      </defs>

      {/* chip gravado */}
      <rect x="0" y="0" width="40" height="40" rx="10" fill="url(#bc-chip)" />
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.25" fill="none" stroke="rgba(255,255,255,.10)" />

      {/* pódio: 2º (esq.), 1º (centro, mais alto), 3º (dir.) */}
      <rect x="7.5" y="23" width="7.5" height="9.5" rx="1.6" fill="#c4ac7c" />
      <rect x="16.25" y="18.5" width="7.5" height="14" rx="1.6" fill="#efe2c2" />
      <rect x="25" y="26" width="7.5" height="6.5" rx="1.6" fill="#9c7f4f" />

      {/* ▲ upvote dourado no topo do 1º */}
      <path d="M20 6.2 L25 12.4 L15 12.4 Z" fill="url(#bc-gold)" />
    </svg>
  );
}
