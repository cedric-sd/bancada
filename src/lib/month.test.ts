import { addMonths, formatMonth, monthBounds, monthKey, startOfMonth, timeLeftLabel } from './month';

describe('month', () => {
  it('startOfMonth volta para o dia 1º (UTC)', () => {
    expect(startOfMonth(new Date('2026-07-24T15:00:00Z')).toISOString()).toBe('2026-07-01T00:00:00.000Z');
    // O próprio dia 1º permanece.
    expect(startOfMonth(new Date('2026-07-01T23:59:00Z')).toISOString()).toBe('2026-07-01T00:00:00.000Z');
    // Último dia pertence ao mês corrente.
    expect(startOfMonth(new Date('2026-07-31T12:00:00Z')).toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('monthKey e addMonths (com virada de ano)', () => {
    expect(monthKey(new Date('2026-07-24T00:00:00Z'))).toBe('2026-07');
    expect(addMonths(new Date('2026-07-01T00:00:00Z'), 1).toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(addMonths(new Date('2026-01-01T00:00:00Z'), -2).toISOString()).toBe('2025-11-01T00:00:00.000Z');
    expect(addMonths(new Date('2026-12-01T00:00:00Z'), 1).toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('monthBounds cobre o mês inteiro', () => {
    const b = monthBounds('2026-07');
    expect(b.start).toBe('2026-07-01 00:00:00');
    expect(b.end).toBe('2026-08-01 00:00:00');
    // Fevereiro (28 dias em ano não bissexto).
    expect(monthBounds('2026-02').end).toBe('2026-03-01 00:00:00');
  });

  it('formatMonth', () => {
    expect(formatMonth('2026-07')).toBe('julho 2026');
    expect(formatMonth('2026-01')).toBe('janeiro 2026');
    expect(formatMonth('2025-12')).toBe('dezembro 2025');
  });

  it('timeLeftLabel', () => {
    // 1º de julho 00:00 → faltam 31 dias para 1º de agosto (julho tem 31 dias).
    expect(timeLeftLabel(new Date('2026-07-01T00:00:00Z'))).toBe('31d');
    // 31 de julho 22:00 → faltam 2h.
    expect(timeLeftLabel(new Date('2026-07-31T22:00:00Z'))).toBe('2h');
  });
});
