import { MaterialType } from './types';
import type { Grid } from '../simulation/grid';

export function tryFall(x: number, y: number, grid: Grid): boolean {
  const ny = y + grid.gravityDir;
  if (!grid.inBounds(x, ny)) return false;
  if (grid.getDensity(x, y) > grid.getDensity(x, ny)) {
    grid.swap(x, y, x, ny);
    return true;
  }
  return false;
}

export function trySlide(x: number, y: number, grid: Grid): boolean {
  const ny = y + grid.gravityDir;
  if (!grid.inBounds(x, ny)) return false;
  const myDensity = grid.getDensity(x, y);
  if (myDensity > grid.getDensity(x, ny)) return false; // straight fall still possible
  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (grid.inBounds(nx, ny) && myDensity > grid.getDensity(nx, ny)) {
      grid.swap(x, y, nx, ny);
      return true;
    }
  }
  return false;
}

/** Lateral spread for liquids. Only displaces into EMPTY cells.
 * Kept separate from trySpreadGas to allow future divergence (e.g. different spread distances). */
export function trySpread(x: number, y: number, grid: Grid): boolean {
  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (grid.inBounds(nx, y) && grid.get(nx, y) === MaterialType.EMPTY) {
      grid.swap(x, y, nx, y);
      return true;
    }
  }
  return false;
}

/** Multi-cell lateral flow for water. Scans up to maxDist cells in each direction,
 * moving to the furthest reachable empty cell. Gives fast leveling behaviour. */
export function tryFlow(x: number, y: number, grid: Grid, maxDist: number = 6): boolean {
  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    let best = -1;
    for (let dist = 1; dist <= maxDist; dist++) {
      const nx = x + dx * dist;
      if (!grid.inBounds(nx, y) || grid.get(nx, y) !== MaterialType.EMPTY) break;
      best = nx;
    }
    if (best !== -1) {
      grid.swap(x, y, best, y);
      return true;
    }
  }
  return false;
}

export function tryRise(x: number, y: number, grid: Grid): boolean {
  const ny = y - grid.gravityDir;
  if (!grid.inBounds(x, ny)) return false;
  // Intentionally EMPTY-only: gases do not displace each other upward.
  if (grid.get(x, ny) === MaterialType.EMPTY) {
    grid.swap(x, y, x, ny);
    return true;
  }
  return false;
}

/** Lateral spread for gases. Only displaces into EMPTY cells.
 * Kept separate from trySpread to allow future divergence (e.g. gas-into-gas displacement). */
export function trySpreadGas(x: number, y: number, grid: Grid): boolean {
  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    const nx = x + dx;
    if (grid.inBounds(nx, y) && grid.get(nx, y) === MaterialType.EMPTY) {
      grid.swap(x, y, nx, y);
      return true;
    }
  }
  return false;
}
