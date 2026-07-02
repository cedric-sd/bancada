import Link from 'next/link';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

/**
 * Botão escuro gravado (ações primárias: Publicar, Abrir).
 * Renderiza como link quando `href` é informado; senão, como <button>.
 */
export default function DarkButton({
  children,
  size = 'md',
  style,
  href,
  type = 'button',
  ...rest
}: {
  children: ReactNode;
  size?: 'md' | 'lg';
  style?: CSSProperties;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const dims =
    size === 'lg'
      ? { font: '800 13px var(--font-archivo)', padding: '0 20px', radius: 11, height: 54 }
      : { font: '800 11px var(--font-mono)', padding: '10px 15px', radius: 9, height: 'auto' as const };

  const baseStyle: CSSProperties = {
    font: dims.font,
    letterSpacing: '.03em',
    color: '#f1e7cd',
    padding: dims.padding,
    height: dims.height,
    borderRadius: dims.radius,
    background: 'linear-gradient(#3a3022,#211a10)',
    border: '1px solid #120d07',
    boxShadow: '0 4px 0 #15100a,0 6px 11px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    ...style,
  };

  if (href) {
    // Links externos (http/https) abrem em nova aba; internos usam next/link.
    if (/^https?:\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className="press" style={baseStyle}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className="press" style={baseStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button className="press" type={type} style={baseStyle} {...rest}>
      {children}
    </button>
  );
}
