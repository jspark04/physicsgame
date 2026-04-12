// src/simulation/grid.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from './grid';
import { MaterialType } from '../materials/types';

let grid: Grid;
beforeEach(() => { grid = new Grid(10, 10); });

describe('get / set', () => {
  it('defaults to EMPTY', () => expect(grid.get(5, 5)).toBe(MaterialType.EMPTY));
  it('returns EMPTY out-of-bounds', () => {
    expect(grid.get(-1, 0)).toBe(MaterialType.EMPTY);
    expect(grid.get(10, 0)).toBe(MaterialType.EMPTY);
  });
  it('sets and gets material', () => {
    grid.set(3, 4, MaterialType.SAND);
    expect(grid.get(3, 4)).toBe(MaterialType.SAND);
  });
  it('ignores out-of-bounds set', () => {
    expect(() => grid.set(-1, 0, MaterialType.SAND)).not.toThrow();
  });
});

describe('activeCellCount', () => {
  it('starts at 0', () => expect(grid.activeCellCount).toBe(0));
  it('increments when set to non-empty', () => {
    grid.set(0, 0, MaterialType.SAND);
    expect(grid.activeCellCount).toBe(1);
  });
  it('decrements when cleared', () => {
    grid.set(0, 0, MaterialType.SAND);
    grid.set(0, 0, MaterialType.EMPTY);
    expect(grid.activeCellCount).toBe(0);
  });
  it('does not double-count re-setting same cell', () => {
    grid.set(0, 0, MaterialType.SAND);
    grid.set(0, 0, MaterialType.WATER);
    expect(grid.activeCellCount).toBe(1);
  });
});

describe('swap', () => {
  it('swaps two cells', () => {
    grid.set(0, 0, MaterialType.SAND);
    grid.swap(0, 0, 0, 1);
    expect(grid.get(0, 0)).toBe(MaterialType.EMPTY);
    expect(grid.get(0, 1)).toBe(MaterialType.SAND);
  });
  it('swaps temperature', () => {
    grid.set(0, 0, MaterialType.SAND); grid.setTemp(0, 0, 500);
    grid.set(0, 1, MaterialType.WATER); grid.setTemp(0, 1, 20);
    grid.swap(0, 0, 0, 1);
    expect(grid.getTemp(0, 0)).toBe(20);
    expect(grid.getTemp(0, 1)).toBe(500);
  });
  it('swaps lifetime', () => {
    grid.set(0, 0, MaterialType.FIRE); grid.setLifetime(0, 0, 80);
    grid.swap(0, 0, 0, 1);
    expect(grid.getLifetime(0, 0)).toBe(0);
    expect(grid.getLifetime(0, 1)).toBe(80);
  });
  it('marks both cells updated', () => {
    grid.swap(0, 0, 0, 1);
    expect(grid.isUpdated(0, 0)).toBe(true);
    expect(grid.isUpdated(0, 1)).toBe(true);
  });
  it('does not throw on out-of-bounds swap', () => {
    expect(() => grid.swap(0, 0, -1, 0)).not.toThrow();
    expect(() => grid.swap(0, 0, 10, 0)).not.toThrow();
  });
  it('does not change activeCellCount', () => {
    grid.set(0, 0, MaterialType.SAND);
    expect(grid.activeCellCount).toBe(1);
    grid.swap(0, 0, 0, 1);
    expect(grid.activeCellCount).toBe(1);
  });
});

describe('temperature', () => {
  it('defaults to 20', () => expect(grid.getTemp(5, 5)).toBe(20));
  it('sets and gets', () => { grid.setTemp(3, 3, 500); expect(grid.getTemp(3, 3)).toBe(500); });
  it('addTemp accumulates', () => {
    grid.setTemp(3, 3, 100); grid.addTemp(3, 3, 50);
    expect(grid.getTemp(3, 3)).toBe(150);
  });
  it('returns 20 out-of-bounds', () => expect(grid.getTemp(-1, 0)).toBe(20));
});

describe('lifetime', () => {
  it('defaults to 0', () => expect(grid.getLifetime(5, 5)).toBe(0));
  it('sets and gets', () => { grid.setLifetime(2, 2, 120); expect(grid.getLifetime(2, 2)).toBe(120); });
});

describe('updated flags', () => {
  it('starts false', () => expect(grid.isUpdated(0, 0)).toBe(false));
  it('markUpdated sets true', () => { grid.markUpdated(3, 3); expect(grid.isUpdated(3, 3)).toBe(true); });
  it('clearUpdatedFlags resets all', () => {
    grid.markUpdated(3, 3); grid.clearUpdatedFlags();
    expect(grid.isUpdated(3, 3)).toBe(false);
  });
});

describe('getDensity', () => {
  it('returns density of cell material', () => {
    grid.set(5, 5, MaterialType.SAND);
    expect(grid.getDensity(5, 5)).toBe(1.5);
  });
  it('returns 0 for empty', () => expect(grid.getDensity(5, 5)).toBe(0));
});

describe('clear', () => {
  it('resets all cells', () => {
    grid.set(0, 0, MaterialType.SAND); grid.setTemp(0, 0, 500);
    grid.clear();
    expect(grid.get(0, 0)).toBe(MaterialType.EMPTY);
    expect(grid.getTemp(0, 0)).toBe(20);
    expect(grid.activeCellCount).toBe(0);
  });
});

describe('serialize / deserialize', () => {
  it('round-trips grid state', () => {
    grid.set(1, 1, MaterialType.SAND); grid.setTemp(1, 1, 300); grid.setLifetime(1, 1, 50);
    const data = grid.serialize();
    const g2 = new Grid(10, 10);
    g2.deserialize(data);
    expect(g2.get(1, 1)).toBe(MaterialType.SAND);
    expect(g2.getTemp(1, 1)).toBe(300);
    expect(g2.getLifetime(1, 1)).toBe(50);
    expect(g2.activeCellCount).toBe(1);
  });
});
