import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

registerHandler(MaterialType.SALT, (x, y, grid) => {
  // Dissolve in adjacent water
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.WATER && Math.random() < 0.15) {
      grid.set(x, y, MaterialType.EMPTY);
      grid.markUpdated(x, y);
      return;
    }
  }

  tryFall(x, y, grid);
});
