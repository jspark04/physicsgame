import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './ice';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.ICE)!(x, y, g);

describe('updateIce', () => {
  it('melts to water when temp > 5 (probabilistic — 500 tries)', () => {
    let melted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ICE);
      g.setTemp(2, 2, 50);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER) { melted = true; break; }
    }
    expect(melted).toBe(true);
  });

  it('does not melt when temp <= 5', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ICE);
    g.setTemp(2, 2, 3);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.ICE);
  });

  it('absorbs heat from neighbors when melting', () => {
    let absorbed = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ICE);
      g.setTemp(2, 2, 50);
      g.set(2, 1, MaterialType.STONE);
      g.setTemp(2, 1, 80);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER && g.getTemp(2, 1) < 80) { absorbed = true; break; }
    }
    expect(absorbed).toBe(true);
  });
});
