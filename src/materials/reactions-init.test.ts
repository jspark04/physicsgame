import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './reactions-init';
import { checkReaction } from './reactions';

describe('water + fire reaction', () => {
  it('extinguishes fire adjacent to water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(2, 3, MaterialType.FIRE); g.setLifetime(2, 3, 60);
    checkReaction(2, 2, 2, 3, g);
    expect(g.get(2, 3)).toBe(MaterialType.EMPTY);
  });
  it('cools water slightly after extinguishing', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER); g.setTemp(2, 2, 50);
    g.set(2, 3, MaterialType.FIRE); g.setLifetime(2, 3, 60);
    checkReaction(2, 2, 2, 3, g);
    expect(g.getTemp(2, 2)).toBeLessThan(50);
  });
});
