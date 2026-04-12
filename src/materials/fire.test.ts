import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './fire';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.FIRE)!(x, y, g);

describe('updateFire', () => {
  it('decrements lifetime each tick', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.FIRE); g.setLifetime(2, 2, 100);
    update(2, 2, g);
    expect(g.getLifetime(2, 2)).toBeLessThan(100);
  });
  it('becomes EMPTY when lifetime hits 0', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.FIRE); g.setLifetime(2, 2, 1);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
  });
  it('heats adjacent neighbors', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.FIRE); g.setLifetime(2, 2, 60); g.setTemp(2, 2, 900);
    update(2, 2, g);
    expect(g.getTemp(2, 1)).toBeGreaterThan(20);
    expect(g.getTemp(3, 2)).toBeGreaterThan(20);
  });
});
