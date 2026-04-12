import { describe, it, expect } from 'vitest';
import { MaterialType, MATERIAL_META, getDensity } from './types';

describe('MATERIAL_META', () => {
  it('has an entry for every MaterialType', () => {
    const types = [
      MaterialType.EMPTY, MaterialType.SAND, MaterialType.WATER,
      MaterialType.FIRE, MaterialType.SMOKE, MaterialType.GUNPOWDER,
      MaterialType.PLANT, MaterialType.WOOD, MaterialType.OIL,
      MaterialType.STEAM, MaterialType.STONE,
    ];
    for (const t of types) {
      expect(MATERIAL_META[t]).toBeDefined();
      expect(MATERIAL_META[t].name.length).toBeGreaterThan(0);
    }
  });
});

describe('getDensity', () => {
  it('returns 0 for EMPTY', () => expect(getDensity(MaterialType.EMPTY)).toBe(0));
  it('OIL is less dense than WATER', () => {
    expect(getDensity(MaterialType.OIL)).toBeLessThan(getDensity(MaterialType.WATER));
  });
  it('SAND is denser than WATER', () => {
    expect(getDensity(MaterialType.SAND)).toBeGreaterThan(getDensity(MaterialType.WATER));
  });
  it('WATER is denser than OIL', () => {
    expect(getDensity(MaterialType.WATER)).toBeGreaterThan(getDensity(MaterialType.OIL));
  });
});
