/**
 * @jest-environment node
 */
import { crossedMilestone } from './juice';

describe('crossedMilestone', () => {
  it('detecta o marco cruzado ao subir um voto', () => {
    expect(crossedMilestone(99, 100)).toBe(100);
    expect(crossedMilestone(999, 1000)).toBe(1000);
    expect(crossedMilestone(9, 10)).toBe(10);
  });

  it('não dispara quando nenhum marco é cruzado', () => {
    expect(crossedMilestone(100, 101)).toBeNull();
    expect(crossedMilestone(500, 501)).toBeNull();
    expect(crossedMilestone(3, 4)).toBeNull();
  });

  it('ignora quedas ou empates (desfazer voto não celebra)', () => {
    expect(crossedMilestone(100, 99)).toBeNull();
    expect(crossedMilestone(100, 100)).toBeNull();
    expect(crossedMilestone(1000, 5)).toBeNull();
  });

  it('devolve o maior marco quando o salto cobre mais de um', () => {
    // Salto grande (ex.: votos concorrentes) cruza 100 e 250 → celebra o maior.
    expect(crossedMilestone(90, 260)).toBe(250);
    expect(crossedMilestone(0, 100000)).toBe(100000);
  });
});
