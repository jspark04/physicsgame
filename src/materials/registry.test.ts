import { describe, it, expect, beforeEach } from 'vitest';
import { MaterialType } from './types';
import { registerHandler, getHandler, _resetForTests } from './registry';
import type { Grid } from '../simulation/grid';

beforeEach(() => _resetForTests());

describe('registerHandler / getHandler', () => {
  it('returns undefined for unregistered type', () => {
    expect(getHandler(MaterialType.SAND)).toBeUndefined();
  });
  it('returns registered handler', () => {
    const handler = (_x: number, _y: number, _grid: Grid) => {};
    registerHandler(MaterialType.SAND, handler);
    expect(getHandler(MaterialType.SAND)).toBe(handler);
  });
  it('overwrites existing handler on re-registration', () => {
    const h1 = (_x: number, _y: number, _grid: Grid) => {};
    const h2 = (_x: number, _y: number, _grid: Grid) => {};
    registerHandler(MaterialType.SAND, h1);
    registerHandler(MaterialType.SAND, h2);
    expect(getHandler(MaterialType.SAND)).toBe(h2);
  });
});
