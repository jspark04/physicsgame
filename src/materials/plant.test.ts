import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './plant';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.PLANT)!(x, y, g);

describe('updatePlant', () => {
  it('spreads to adjacent water cell (2000 tries)', () => {
    let spread = false;
    for (let i = 0; i < 2000; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.PLANT);
      g.set(2, 1, MaterialType.WATER);
      update(2, 2, g);
      if (g.get(2, 1) === MaterialType.PLANT) { spread = true; break; }
    }
    expect(spread).toBe(true);
  });

  it('does not spread into empty cells', () => {
    let spread = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.PLANT);
      // all neighbors are EMPTY — plant should not spread
      update(2, 2, g);
      const neighbors: [number,number][] = [[2,1],[2,3],[1,2],[3,2]];
      if (neighbors.some(([nx,ny]) => g.get(nx,ny) === MaterialType.PLANT)) { spread = true; break; }
    }
    expect(spread).toBe(false);
  });
  it('does not spread when all neighbors blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.PLANT);
    g.set(2, 1, MaterialType.STONE); g.set(2, 3, MaterialType.STONE);
    g.set(1, 2, MaterialType.STONE); g.set(3, 2, MaterialType.STONE);
    for (let i = 0; i < 100; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.PLANT);
  });
  it('ignites when temp >= 100 (probabilistic — 200 tries)', () => {
    let ignited = false;
    for (let i = 0; i < 200; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.PLANT); g.setTemp(2, 2, 150);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.FIRE) { ignited = true; break; }
    }
    expect(ignited).toBe(true);
  });
});
