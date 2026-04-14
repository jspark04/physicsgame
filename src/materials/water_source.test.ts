import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './water_source';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.WATER_SOURCE)!(x, y, g);

describe('updateWaterSource', () => {
  it('emits water into an adjacent empty cell (probabilistic — 500 tries)', () => {
    let emitted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.WATER_SOURCE);
      update(2, 2, g);
      const neighbors: [number,number][] = [[2,3],[2,1],[1,2],[3,2]];
      if (neighbors.some(([nx,ny]) => g.get(nx,ny) === MaterialType.WATER)) { emitted = true; break; }
    }
    expect(emitted).toBe(true);
  });

  it('does not change its own cell type', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER_SOURCE);
    for (let i = 0; i < 100; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.WATER_SOURCE);
  });
});
