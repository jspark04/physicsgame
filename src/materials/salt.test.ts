import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './salt';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SALT)!(x, y, g);

describe('updateSalt', () => {
  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SALT);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.SALT);
  });

  it('dissolves when adjacent to water (probabilistic — 500 tries)', () => {
    let dissolved = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SALT);
      g.set(2, 3, MaterialType.STONE); // block below
      g.set(2, 1, MaterialType.WATER);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.EMPTY) { dissolved = true; break; }
    }
    expect(dissolved).toBe(true);
  });

  it('does not dissolve without water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SALT);
    g.set(2, 3, MaterialType.STONE); // block below
    g.set(1, 3, MaterialType.STONE); // block diagonal slides
    g.set(3, 3, MaterialType.STONE);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.SALT);
  });
});
