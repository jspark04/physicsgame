import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

const GLASS_TEMP = 800;

registerHandler(MaterialType.SAND, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp >= GLASS_TEMP && Math.random() < 0.01) {
    grid.set(x, y, MaterialType.GLASS);
    grid.setTemp(x, y, temp - 100); // melting absorbs heat
    grid.markUpdated(x, y);
    return;
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
