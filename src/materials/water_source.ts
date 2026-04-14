import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.WATER_SOURCE, (x, y, grid) => {
  if (Math.random() >= 0.3) return;

  // Try to emit below first, then sides, then above
  const dirs: [number, number][] = [
    [0, grid.gravityDir], [-1, 0], [1, 0], [0, -grid.gravityDir],
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.EMPTY) {
      grid.set(nx, ny, MaterialType.WATER);
      grid.setTemp(nx, ny, 20);
      grid.markUpdated(nx, ny);
      return;
    }
  }
});
