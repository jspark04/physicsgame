import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

const IGNITION_TEMP = 200;

registerHandler(MaterialType.GUNPOWDER, (x, y, grid) => {
  const temp = grid.getTemp(x, y);
  if (temp >= IGNITION_TEMP) {
    grid.set(x, y, MaterialType.FIRE);
    grid.setLifetime(x, y, 8 + Math.floor(Math.random() * 8));
    grid.setTemp(x, y, 1200);
    grid.markUpdated(x, y);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.GUNPOWDER) {
          grid.setTemp(nx, ny, IGNITION_TEMP + 100);
        }
      }
    }
    return;
  }
  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
