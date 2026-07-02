/**
 * @jest-environment node
 */
import { tierForLevel } from './tiers';

describe('tierForLevel', () => {
  it('faixas nos limites certos (3 / 6 / 10)', () => {
    expect(tierForLevel(1).key).toBe('builder');
    expect(tierForLevel(2).key).toBe('builder');
    expect(tierForLevel(3).key).toBe('bronze');
    expect(tierForLevel(5).key).toBe('bronze');
    expect(tierForLevel(6).key).toBe('prata');
    expect(tierForLevel(9).key).toBe('prata');
    expect(tierForLevel(10).key).toBe('ouro');
    expect(tierForLevel(42).key).toBe('ouro');
  });

  it('cada faixa tem título e selo', () => {
    expect(tierForLevel(1).badge).toBe('BUILDER');
    expect(tierForLevel(3).badge).toBe('BRONZE DEV');
    expect(tierForLevel(6).badge).toBe('PRATA DEV');
    expect(tierForLevel(10).badge).toBe('OURO DEV');
    expect(tierForLevel(10).title).toBe('Ouro');
  });
});
