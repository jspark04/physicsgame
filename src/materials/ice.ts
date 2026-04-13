import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.ICE, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Passively stay cold
  if (temp > 0) grid.setTemp(x, y, temp - 0.3);

  // Melt to water when warm enough
  if (temp > 5 && Math.random() < 0.02) {
    grid.set(x, y, MaterialType.WATER);
    grid.setTemp(x, y, Math.max(0, temp - 50));
    grid.markUpdated(x, y);
    // Endothermic: absorb heat from neighbours during melting
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
      grid.addTemp(x + dx, y + dy, -10);
    }
  }
  // Ice is static — no movement
});
