import { MaterialType } from './types';
import { registerHandler } from './registry';

const IGNITION_TEMP = 250;

registerHandler(MaterialType.WOOD, (x, y, grid) => {
  const temp = grid.getTemp(x, y);
  if (temp >= IGNITION_TEMP && Math.random() < 0.08) {
    grid.set(x, y, MaterialType.FIRE);
    grid.setLifetime(x, y, 80 + Math.floor(Math.random() * 60));
    grid.setTemp(x, y, 900);
    grid.markUpdated(x, y);
    const aboveY = y - grid.gravityDir;
    if (grid.inBounds(x, aboveY) && grid.get(x, aboveY) === MaterialType.EMPTY && Math.random() < 0.4) {
      grid.set(x, aboveY, MaterialType.SMOKE);
      grid.setLifetime(x, aboveY, 100 + Math.floor(Math.random() * 60));
    }
  }
  // Wood never moves
});
