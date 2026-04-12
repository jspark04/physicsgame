import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import { tryFall, trySlide, trySpread, tryRise, trySpreadGas } from './movement';

describe('tryFall', () => {
  it('moves particle into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SAND);
    expect(tryFall(2, 2, g)).toBe(true);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
    expect(g.get(2, 3)).toBe(MaterialType.SAND);
  });
  it('does not move when cell below is denser', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(2, 3, MaterialType.SAND);
    expect(tryFall(2, 2, g)).toBe(false);
  });
  it('does not move at bottom edge', () => {
    const g = new Grid(5, 5);
    g.set(2, 4, MaterialType.SAND);
    expect(tryFall(2, 4, g)).toBe(false);
  });
  it('sand sinks through water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SAND);
    g.set(2, 3, MaterialType.WATER);
    expect(tryFall(2, 2, g)).toBe(true);
    expect(g.get(2, 3)).toBe(MaterialType.SAND);
    expect(g.get(2, 2)).toBe(MaterialType.WATER);
  });
  it('water falls through oil', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(2, 3, MaterialType.OIL);
    expect(tryFall(2, 2, g)).toBe(true);
  });
  it('oil does not fall through water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.OIL);
    g.set(2, 3, MaterialType.WATER);
    expect(tryFall(2, 2, g)).toBe(false);
  });
  it('respects flipped gravity', () => {
    const g = new Grid(5, 5);
    g.gravityDir = -1;
    g.set(2, 2, MaterialType.SAND);
    expect(tryFall(2, 2, g)).toBe(true);
    expect(g.get(2, 1)).toBe(MaterialType.SAND);
  });
});

describe('trySlide', () => {
  it('slides diagonally when below is blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 1, MaterialType.SAND);
    g.set(2, 2, MaterialType.STONE);
    expect(trySlide(2, 1, g)).toBe(true);
    expect(g.get(2, 1)).toBe(MaterialType.EMPTY);
    const moved = g.get(1, 2) === MaterialType.SAND || g.get(3, 2) === MaterialType.SAND;
    expect(moved).toBe(true);
  });
  it('returns false when diagonals also blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 1, MaterialType.SAND);
    g.set(2, 2, MaterialType.STONE);
    g.set(1, 2, MaterialType.STONE);
    g.set(3, 2, MaterialType.STONE);
    expect(trySlide(2, 1, g)).toBe(false);
  });
});

describe('trySpread', () => {
  it('moves laterally into adjacent empty cell', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    expect(trySpread(2, 2, g)).toBe(true);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
  });
  it('returns false when both sides blocked', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER);
    g.set(1, 2, MaterialType.STONE);
    g.set(3, 2, MaterialType.STONE);
    expect(trySpread(2, 2, g)).toBe(false);
  });
});

describe('tryRise', () => {
  it('moves gas upward into empty cell', () => {
    const g = new Grid(5, 5);
    g.set(2, 3, MaterialType.SMOKE);
    expect(tryRise(2, 3, g)).toBe(true);
    expect(g.get(2, 2)).toBe(MaterialType.SMOKE);
  });
  it('does not rise when above is occupied', () => {
    const g = new Grid(5, 5);
    g.set(2, 3, MaterialType.SMOKE);
    g.set(2, 2, MaterialType.STONE);
    expect(tryRise(2, 3, g)).toBe(false);
  });
  it('does not rise at top edge', () => {
    const g = new Grid(5, 5);
    g.set(2, 0, MaterialType.SMOKE);
    expect(tryRise(2, 0, g)).toBe(false);
  });
});

describe('trySpreadGas', () => {
  it('moves gas sideways into empty cell', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SMOKE);
    expect(trySpreadGas(2, 2, g)).toBe(true);
    expect(g.get(2, 2)).toBe(MaterialType.EMPTY);
  });
});
