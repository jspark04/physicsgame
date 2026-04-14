import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.FIRE_SOURCE, (x, y, grid) => {
  if (Math.random() >= 0.5) return;

  // Try to emit above first (fire rises), then sides, then below
  const dirs: [number, number][] = [
    [0, -grid.gravityDir], [-1, 0], [1, 0], [0, grid.gravityDir],
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.EMPTY) {
      grid.set(nx, ny, MaterialType.FIRE);
      grid.setLifetime(nx, ny, 80 + Math.floor(Math.random() * 40));
      grid.setTemp(nx, ny, 900);
      grid.markUpdated(nx, ny);
      return;
    }
  }
});
