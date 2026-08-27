/**
 * @jest-environment node
 */
import { movementBetween } from './monthly';

describe('movementBetween', () => {
  it('marca subida, queda e manutenção de posição', () => {
    // Mês passado: a, b, c. Agora: b subiu, a caiu, c manteve.
    const moves = movementBetween(['b', 'a', 'c'], ['a', 'b', 'c']);
    expect(moves.b).toEqual({ delta: 1, isNew: false }); // 2º → 1º
    expect(moves.a).toEqual({ delta: -1, isNew: false }); // 1º → 2º
    expect(moves.c).toEqual({ delta: 0, isNew: false }); // 3º → 3º
  });

  it('marca projeto que entrou na disputa como novo', () => {
    const moves = movementBetween(['novo', 'a'], ['a']);
    expect(moves.novo).toEqual({ delta: 0, isNew: true });
    expect(moves.a).toEqual({ delta: -1, isNew: false }); // 1º → 2º
  });

  it('só devolve movimento para projetos do mês atual', () => {
    const moves = movementBetween(['a'], ['a', 'b']);
    expect(Object.keys(moves)).toEqual(['a']); // 'b' saiu da disputa → não aparece
    expect(moves.a).toEqual({ delta: 0, isNew: false });
  });

  it('mês anterior vazio → tudo é novo', () => {
    const moves = movementBetween(['a', 'b'], []);
    expect(moves.a).toEqual({ delta: 0, isNew: true });
    expect(moves.b).toEqual({ delta: 0, isNew: true });
  });
});
