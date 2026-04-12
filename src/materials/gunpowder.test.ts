import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './gunpowder';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.GUNPOWDER)!(x, y, g);

describe('updateGunpowder', () => {
  it('falls like a powder', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.GUNPOWDER);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.GUNPOWDER);
  });
  it('ignites when temp >= 200', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.GUNPOWDER); g.setTemp(2, 2, 250);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.FIRE);
  });
  it('chain-heats adjacent gunpowder', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.GUNPOWDER);
    g.set(3, 2, MaterialType.GUNPOWDER);
    g.setTemp(2, 2, 250);
    update(2, 2, g);
    expect(g.getTemp(3, 2)).toBeGreaterThanOrEqual(200);
  });
});
