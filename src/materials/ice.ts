import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.ICE, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Passively stay cold
  if (temp > 0) grid.setTemp(x, y, temp - 0.3);

  // Melt probability scales with temperature (ice melts slower than snow —
  // higher latent heat). Near 0% at 5 °C, ~32% at 100 °C, capped at 95%.
  if (temp > 5) {
    const meltChance = Math.min(0.95, (temp - 5) / 150 * 0.5);
    if (Math.random() < meltChance) {
      grid.set(x, y, MaterialType.WATER);
      grid.setTemp(x, y, Math.max(0, temp - 50));
      grid.markUpdated(x, y);
      // Endothermic: absorb heat from neighbours during melting
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
        grid.addTemp(x + dx, y + dy, -10);
      }
    }
  }
  // Ice is static — no movement
});
