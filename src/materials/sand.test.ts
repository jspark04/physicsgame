import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './sand';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SAND)!(x, y, g);

describe('updateSand', () => {
  it('falls straight down into empty', () => {
    const g = new Grid(5, 5);
    g.set(2, 0, MaterialType.SAND);
    update(2, 0, g);
    expect(g.get(2, 0)).toBe(MaterialType.EMPTY);
    expect(g.get(2, 1)).toBe(MaterialType.SAND);
  });
  it('slides diagonally when below is blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 1, MaterialType.SAND);
    g.set(2, 2, MaterialType.STONE);
    update(2, 1, g);
    expect(g.get(2, 1)).toBe(MaterialType.EMPTY);
    expect(g.get(1, 2) === MaterialType.SAND || g.get(3, 2) === MaterialType.SAND).toBe(true);
  });
  it('stays put when all downward paths blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 1, MaterialType.SAND);
    g.set(2, 2, MaterialType.STONE);
    g.set(1, 2, MaterialType.STONE);
    g.set(3, 2, MaterialType.STONE);
    update(2, 1, g);
    expect(g.get(2, 1)).toBe(MaterialType.SAND);
  });
  it('sinks through water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SAND);
    g.set(2, 3, MaterialType.WATER);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.SAND);
    expect(g.get(2, 2)).toBe(MaterialType.WATER);
  });
  it('transforms to glass when temp > 800 (probabilistic — 500 tries)', () => {
    let formed = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SAND);
      g.setTemp(2, 2, 850);
      g.set(2, 3, MaterialType.STONE); // block below so sand stays
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.GLASS) { formed = true; break; }
    }
    expect(formed).toBe(true);
  });
});
