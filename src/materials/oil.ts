import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySpread } from './movement';

const OIL_IGNITION_TEMP = 150;

registerHandler(MaterialType.OIL, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp >= OIL_IGNITION_TEMP && Math.random() < 0.05) {
    grid.set(x, y, MaterialType.FIRE);
    grid.setLifetime(x, y, 60 + Math.floor(Math.random() * 60));
    grid.setTemp(x, y, 900);
    grid.markUpdated(x, y);
    return;
  }

  if (!tryFall(x, y, grid)) trySpread(x, y, grid);
});
