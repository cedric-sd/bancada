/**
 * @jest-environment node
 */
import { formatStars, parseRepo } from './github';

describe('parseRepo', () => {
  it('extrai owner/repo de URLs do GitHub', () => {
    expect(parseRepo('https://github.com/vercel/next.js')).toEqual({ owner: 'vercel', repo: 'next.js' });
    expect(parseRepo('https://www.github.com/vercel/next.js')).toEqual({ owner: 'vercel', repo: 'next.js' });
    expect(parseRepo('https://github.com/voce/projeto.git')).toEqual({ owner: 'voce', repo: 'projeto' });
    // caminho extra (issues, tree…) ainda resolve o repo
    expect(parseRepo('https://github.com/a/b/tree/main')).toEqual({ owner: 'a', repo: 'b' });
  });

  it('rejeita o que não é um repositório do GitHub', () => {
    expect(parseRepo('https://gitlab.com/a/b')).toBeNull();
    expect(parseRepo('https://github.com/soloowner')).toBeNull();
    expect(parseRepo('não é url')).toBeNull();
    expect(parseRepo('')).toBeNull();
  });
});

describe('formatStars', () => {
  it('formata milhares com k', () => {
    expect(formatStars(0)).toBe('0');
    expect(formatStars(999)).toBe('999');
    expect(formatStars(1200)).toBe('1.2k');
    expect(formatStars(15400)).toBe('15.4k');
  });
});
