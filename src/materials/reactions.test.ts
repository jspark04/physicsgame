import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import { registerReaction, checkReaction, _resetForTests } from './reactions';

beforeEach(() => _resetForTests());

describe('registerReaction / checkReaction', () => {
  it('returns false when no reaction registered', () => {
    const g = new Grid(5, 5);
    g.set(0, 0, MaterialType.WATER);
    g.set(0, 1, MaterialType.FIRE);
    expect(checkReaction(0, 0, 0, 1, g)).toBe(false);
  });
  it('calls handler and returns true when reaction registered', () => {
    const g = new Grid(5, 5);
    g.set(0, 0, MaterialType.WATER);
    g.set(0, 1, MaterialType.FIRE);
    let called = false;
    registerReaction(MaterialType.WATER, MaterialType.FIRE, () => { called = true; });
    expect(checkReaction(0, 0, 0, 1, g)).toBe(true);
    expect(called).toBe(true);
  });
  it('reaction is symmetric — (FIRE, WATER) matches (WATER, FIRE) handler', () => {
    const g = new Grid(5, 5);
    g.set(0, 0, MaterialType.FIRE);
    g.set(0, 1, MaterialType.WATER);
    let called = false;
    registerReaction(MaterialType.WATER, MaterialType.FIRE, () => { called = true; });
    // checkReaction with FIRE first, WATER second — should still match
    expect(checkReaction(0, 0, 0, 1, g)).toBe(true);
    expect(called).toBe(true);
  });
});
