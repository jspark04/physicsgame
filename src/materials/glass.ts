import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.GLASS, (x, y, grid) => {
  const temp = grid.getTemp(x, y);
  if (temp > 20) grid.setTemp(x, y, Math.max(20, temp - 2));
});
