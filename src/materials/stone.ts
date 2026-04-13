import { MaterialType } from './types';
import { registerHandler } from './registry';

// Fraction of temperature difference transferred to each neighbor per tick.
// Low enough that heat builds up visibly before water boils.
const CONDUCTIVITY = 0.002;

registerHandler(MaterialType.STONE, (x, y, grid) => {
  const myTemp = grid.getTemp(x, y);
  if (myTemp <= 20) return; // at ambient — nothing to conduct

  // Transfer heat to all 4 orthogonal neighbors, then apply net loss to stone.
  let totalLoss = 0;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx;
    const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    const delta = (myTemp - grid.getTemp(nx, ny)) * CONDUCTIVITY;
    if (delta > 0) {
      grid.addTemp(nx, ny, delta);
      totalLoss += delta;
    }
  }
  grid.addTemp(x, y, -totalLoss);
});
