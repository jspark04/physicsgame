import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './wood';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.WOOD)!(x, y, g);

describe('updateWood', () => {
  it('ignites at temp >= 250 (probabilistic — 200 tries)', () => {
    let ignited = false;
    for (let i = 0; i < 200; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.WOOD); g.setTemp(2, 2, 300);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.FIRE) { ignited = true; break; }
    }
    expect(ignited).toBe(true);
  });
  it('does not ignite below 250 in 100 tries', () => {
    for (let i = 0; i < 100; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.WOOD); g.setTemp(2, 2, 200);
      update(2, 2, g);
      expect(g.get(2, 2)).toBe(MaterialType.WOOD);
    }
  });
});
