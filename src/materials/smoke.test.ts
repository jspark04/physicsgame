import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './smoke';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SMOKE)!(x, y, g);

describe('updateSmoke', () => {
  it('rises or spreads (moves away)', () => {
    const g = new Grid(5, 5);
    g.set(2, 3, MaterialType.SMOKE); g.setLifetime(2, 3, 80);
    update(2, 3, g);
    // Smoke should have moved (risen or spread), so original position changes
    expect(g.get(2, 3)).not.toBe(MaterialType.SMOKE);
  });
  it('disappears at lifetime 0', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SMOKE); g.setLifetime(2, 2, 1);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
  });
});
