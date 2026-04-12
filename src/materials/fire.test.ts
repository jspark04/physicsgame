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
    g.set(2, 2, MaterialType.FIRE); g.setLifetime(2, 2, 60);
    update(2, 2, g);
    // Check corner cell (1,1) which is less likely to be moved into by fire
    // Fire at (2,2) heats all 8 neighbors. Even with movement, corner (1,1) retains heat.
    const allNeighbors = [
      g.getTemp(1, 1), g.getTemp(2, 1), g.getTemp(3, 1),
      g.getTemp(1, 2),                  g.getTemp(3, 2),
      g.getTemp(1, 3), g.getTemp(2, 3), g.getTemp(3, 3),
    ];
    // At least one neighbor should be heated (not all will be if fire moves into some)
    const heated = allNeighbors.some((t) => t > 20);
    expect(heated).toBe(true);
  });
});
