/**
 * @jest-environment node
 */
import { newUnlocks } from './unlocks';

describe('newUnlocks', () => {
  it('devolve só as conquistas ainda não registradas', () => {
    expect(newUnlocks(['first', 'curator', 'critic'], new Set(['first']))).toEqual(['curator', 'critic']);
  });

  it('nada novo quando tudo já foi registrado', () => {
    expect(newUnlocks(['first', 'curator'], new Set(['first', 'curator']))).toEqual([]);
  });

  it('preserva a ordem das conquistadas', () => {
    expect(newUnlocks(['a', 'b', 'c'], new Set(['b']))).toEqual(['a', 'c']);
  });

  it('sem conquistas → vazio', () => {
    expect(newUnlocks([], new Set(['a']))).toEqual([]);
  });
});
