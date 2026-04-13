import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './lava';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.LAVA)!(x, y, g);

describe('updateLava', () => {
  it('cools to stone when temp < 300', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 200);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.STONE);
  });

  it('stays lava when temp >= 300', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1000);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.LAVA);
  });

  it('radiates heat to neighbors when hot', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    g.set(2, 1, MaterialType.STONE);
    g.setTemp(2, 1, 20);
    update(2, 2, g);
    expect(g.getTemp(2, 1)).toBeGreaterThan(20);
  });

  it('vaporises adjacent water to steam', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    g.set(2, 1, MaterialType.WATER);
    update(2, 2, g);
    expect(g.get(2, 1)).toBe(MaterialType.STEAM);
  });

  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.LAVA);
  });
});
