import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './tnt';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.TNT)!(x, y, g);

describe('updateTNT', () => {
  it('does not explode when cold', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 20);
    update(7, 7, g);
    expect(g.get(7, 7)).toBe(MaterialType.TNT);
  });

  it('explodes when temp >= 150 — clears core and removes self', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    g.set(7, 8, MaterialType.SAND);
    update(7, 7, g);
    expect(g.get(7, 7)).toBe(MaterialType.EMPTY);
    expect(g.get(7, 8)).toBe(MaterialType.EMPTY);
  });

  it('heats cells in blast radius', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    g.set(7, 4, MaterialType.STONE);
    g.setTemp(7, 4, 20);
    update(7, 7, g);
    expect(g.getTemp(7, 4)).toBeGreaterThan(20);
  });

  it('does not destroy water sources', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    g.set(7, 8, MaterialType.WATER_SOURCE);
    update(7, 7, g);
    expect(g.get(7, 8)).toBe(MaterialType.WATER_SOURCE);
  });
});
