/**
 * @jest-environment node
 */
import { pointsFor, XP_POINTS } from './xp';

describe('pointsFor', () => {
  it('devolve os pontos de cada ação de participação', () => {
    expect(pointsFor('vote')).toBe(2);
    expect(pointsFor('review')).toBe(5);
    expect(pointsFor('publish')).toBe(25);
  });

  it('publicar vale mais que avaliar, que vale mais que votar', () => {
    expect(XP_POINTS.publish).toBeGreaterThan(XP_POINTS.review);
    expect(XP_POINTS.review).toBeGreaterThan(XP_POINTS.vote);
  });
});
