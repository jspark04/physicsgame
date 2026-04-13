import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './snow';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SNOW)!(x, y, g);

describe('updateSnow', () => {
  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SNOW);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.SNOW);
  });

  it('melts to water when temp > 5 (probabilistic — 500 tries)', () => {
    let melted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SNOW);
      g.setTemp(2, 2, 50);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER || g.get(2, 3) === MaterialType.WATER) { melted = true; break; }
    }
    expect(melted).toBe(true);
  });

  it('does not melt when cold', () => {
    const g = new Grid(5, 5);
    // Block below so it does not fall
    g.set(2, 2, MaterialType.SNOW);
    g.set(2, 3, MaterialType.STONE);
    g.setTemp(2, 2, 2);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.SNOW);
  });
});
