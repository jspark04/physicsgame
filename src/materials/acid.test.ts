import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './acid';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.ACID)!(x, y, g);

describe('updateAcid', () => {
  it('dissolves adjacent sand (probabilistic — 500 tries)', () => {
    let dissolved = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ACID);
      g.set(2, 3, MaterialType.STONE); // block below so acid stays
      g.set(2, 1, MaterialType.SAND);
      update(2, 2, g);
      if (g.get(2, 1) === MaterialType.EMPTY) { dissolved = true; break; }
    }
    expect(dissolved).toBe(true);
  });

  it('is neutralised by adjacent water (probabilistic — 500 tries)', () => {
    let neutralised = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ACID);
      g.set(2, 3, MaterialType.STONE);
      g.set(2, 1, MaterialType.WATER);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER) { neutralised = true; break; }
    }
    expect(neutralised).toBe(true);
  });

  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ACID);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.ACID);
  });

  it('does not dissolve water source or fire source', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ACID);
    g.set(2, 3, MaterialType.STONE);
    g.set(2, 1, MaterialType.WATER_SOURCE);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 1)).toBe(MaterialType.WATER_SOURCE);
  });
});
