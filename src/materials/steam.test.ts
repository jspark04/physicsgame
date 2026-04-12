import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './steam';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.STEAM)!(x, y, g);

describe('updateSteam', () => {
  it('rises or spreads (moves away)', () => {
    const g = new Grid(5, 5);
    g.set(2, 3, MaterialType.STEAM); g.setLifetime(2, 3, 60);
    update(2, 3, g);
    // Steam should have moved (risen or spread), so original position changes
    expect(g.get(2, 3)).not.toBe(MaterialType.STEAM);
  });
  it('disappears at lifetime 0', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.STEAM); g.setLifetime(2, 2, 1);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
  });
});
