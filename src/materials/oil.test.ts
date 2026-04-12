import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './oil';
import './water';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.OIL)!(x, y, g);

describe('updateOil', () => {
  it('falls into empty below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.OIL);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.OIL);
  });
  it('does not displace water (oil density 0.8 < water 1.0)', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.OIL);
    g.set(2, 3, MaterialType.WATER);
    update(2, 2, g);
    // Water should not be displaced — density system prevents oil from sinking into water
    expect(g.get(2, 3)).toBe(MaterialType.WATER);
  });
  it('water sinks through oil (water 1.0 > oil 0.8)', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(2, 3, MaterialType.OIL);
    getHandler(MaterialType.WATER)!(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.WATER);
    expect(g.get(2, 2)).toBe(MaterialType.OIL);
  });
  it('ignites when temp >= 150 (probabilistic — 200 tries)', () => {
    let ignited = false;
    for (let i = 0; i < 200; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.OIL); g.setTemp(2, 2, 200);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.FIRE) { ignited = true; break; }
    }
    expect(ignited).toBe(true);
  });
});
