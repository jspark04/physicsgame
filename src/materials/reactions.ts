import { MaterialType } from './types';
import type { Grid } from '../simulation/grid';

export type ReactionHandler = (ax: number, ay: number, bx: number, by: number, grid: Grid) => void;

const table = new Map<number, ReactionHandler>();

function key(a: MaterialType, b: MaterialType): number {
  return Math.min(a, b) * 256 + Math.max(a, b);
}

export function registerReaction(a: MaterialType, b: MaterialType, handler: ReactionHandler): void {
  table.set(key(a, b), handler);
}

export function checkReaction(ax: number, ay: number, bx: number, by: number, grid: Grid): boolean {
  const handler = table.get(key(grid.get(ax, ay), grid.get(bx, by)));
  if (handler) { handler(ax, ay, bx, by, grid); return true; }
  return false;
}

/** Reset reaction table — for test isolation only. */
export function _resetForTests(): void { table.clear(); }
