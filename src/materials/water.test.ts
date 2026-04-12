import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './water';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.WATER)!(x, y, g);

describe('updateWater', () => {
  it('falls into empty below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.WATER);
  });
  it('spreads laterally when blocked below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(2, 3, MaterialType.STONE);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
    expect(g.get(1, 2) === MaterialType.WATER || g.get(3, 2) === MaterialType.WATER).toBe(true);
  });
  it('converts to STEAM at 100°C', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.setTemp(2, 2, 100);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.STEAM);
    expect(g.getLifetime(2, 2)).toBeGreaterThan(0);
  });
  it('does not convert below 100°C', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.setTemp(2, 2, 99);
    g.set(2, 3, MaterialType.STONE);
    g.set(1, 2, MaterialType.STONE);
    g.set(3, 2, MaterialType.STONE);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.WATER);
  });
});
