import { addWeeks, formatWeekRange, startOfWeek, timeLeftLabel, weekBounds, weekKey } from './week';

describe('week', () => {
  it('startOfWeek volta para a segunda-feira (UTC)', () => {
    // 2024-01-03 é uma quarta; a segunda é 2024-01-01.
    expect(startOfWeek(new Date('2024-01-03T15:00:00Z')).toISOString()).toBe('2024-01-01T00:00:00.000Z');
    // A própria segunda permanece.
    expect(startOfWeek(new Date('2024-01-01T23:59:00Z')).toISOString()).toBe('2024-01-01T00:00:00.000Z');
    // Domingo pertence à semana que começou na segunda anterior.
    expect(startOfWeek(new Date('2024-01-07T12:00:00Z')).toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('weekKey e addWeeks', () => {
    expect(weekKey(new Date('2024-01-04T00:00:00Z'))).toBe('2024-01-01');
    expect(addWeeks(new Date('2024-01-01T00:00:00Z'), 1).toISOString()).toBe('2024-01-08T00:00:00.000Z');
    expect(addWeeks(new Date('2024-01-08T00:00:00Z'), -2).toISOString()).toBe('2023-12-25T00:00:00.000Z');
  });

  it('weekBounds cobre a semana inteira', () => {
    const b = weekBounds('2024-01-01');
    expect(b.start).toBe('2024-01-01 00:00:00');
    expect(b.end).toBe('2024-01-08 00:00:00');
  });

  it('formatWeekRange', () => {
    expect(formatWeekRange('2024-01-01')).toBe('1 jan – 7 jan');
    expect(formatWeekRange('2024-06-24')).toBe('24 jun – 30 jun');
  });

  it('timeLeftLabel', () => {
    // Segunda 00:00 → faltam 7 dias exatos para a próxima segunda.
    expect(timeLeftLabel(new Date('2024-01-01T00:00:00Z'))).toBe('7d');
    // Sexta 00:00 → faltam 3 dias.
    expect(timeLeftLabel(new Date('2024-01-05T00:00:00Z'))).toBe('3d');
    // Domingo 22:00 → faltam 2h.
    expect(timeLeftLabel(new Date('2024-01-07T22:00:00Z'))).toBe('2h');
  });
});
