/**
 * @jest-environment node
 */
import { streakFromDays } from './streak';

describe('streakFromDays', () => {
  it('conta dias consecutivos terminando hoje', () => {
    expect(streakFromDays(['2024-03-10', '2024-03-09', '2024-03-08'], '2024-03-10')).toBe(3);
  });

  it('mantém o streak vivo se o último ativo foi ontem', () => {
    // Ainda não apareceu hoje, mas veio ontem e anteontem.
    expect(streakFromDays(['2024-03-09', '2024-03-08'], '2024-03-10')).toBe(2);
  });

  it('quebra quando o último dia ativo é anterior a ontem', () => {
    expect(streakFromDays(['2024-03-07', '2024-03-06'], '2024-03-10')).toBe(0);
  });

  it('para no primeiro buraco da sequência', () => {
    // hoje, ontem, [buraco], anteontem-2 → conta só 2.
    expect(streakFromDays(['2024-03-10', '2024-03-09', '2024-03-07'], '2024-03-10')).toBe(2);
  });

  it('ignora dias repetidos e ordem', () => {
    expect(streakFromDays(['2024-03-08', '2024-03-10', '2024-03-09', '2024-03-10'], '2024-03-10')).toBe(3);
  });

  it('sem dias ativos → 0', () => {
    expect(streakFromDays([], '2024-03-10')).toBe(0);
  });

  it('atravessa a virada de mês', () => {
    expect(streakFromDays(['2024-03-01', '2024-02-29', '2024-02-28'], '2024-03-01')).toBe(3);
  });
});
