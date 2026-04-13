import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall } from './movement';

registerHandler(MaterialType.SNOW, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp > 0) grid.setTemp(x, y, temp - 0.2);

  if (temp > 5 && Math.random() < 0.03) {
    grid.set(x, y, MaterialType.WATER);
    grid.setTemp(x, y, Math.max(0, temp - 30));
    grid.markUpdated(x, y);
    return;
  }

  tryFall(x, y, grid);
});
