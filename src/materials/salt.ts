import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

// Water uses its lifetime field as a salinity counter (0 = fresh, >= MAX = saturated).
const MAX_SALINITY = 100;
const SALINITY_PER_GRAIN = 20; // ~5 grains dissolve per water cell before saturation

registerHandler(MaterialType.SALT, (x, y, grid) => {
  // Dissolve in adjacent water that isn't saturated
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    if (grid.get(nx, ny) === MaterialType.WATER
        && grid.getLifetime(nx, ny) < MAX_SALINITY
        && Math.random() < 0.15) {
      grid.setLifetime(nx, ny, grid.getLifetime(nx, ny) + SALINITY_PER_GRAIN);
      grid.set(x, y, MaterialType.EMPTY);
      grid.markUpdated(x, y);
      return;
    }
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
