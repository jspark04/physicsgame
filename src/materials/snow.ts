import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

registerHandler(MaterialType.SNOW, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp > 0) grid.setTemp(x, y, temp - 0.2);

  // Melt probability scales with temperature: near 0% at 5 °C, ~47% at
  // 100 °C, capped at 95%. This ensures snow adjacent to lava melts
  // quickly instead of staying solid despite being at hundreds of degrees.
  if (temp > 5) {
    const meltChance = Math.min(0.95, (temp - 5) / 100 * 0.5);
    if (Math.random() < meltChance) {
      grid.set(x, y, MaterialType.WATER);
      grid.setTemp(x, y, Math.max(0, temp - 30));
      grid.markUpdated(x, y);
      return;
    }
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
