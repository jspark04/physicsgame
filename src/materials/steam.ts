import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryRise, trySpreadGas } from './movement';

registerHandler(MaterialType.STEAM, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Condense back to water if cool enough
  if (temp < 80 && Math.random() < 0.02) {
    grid.set(x, y, MaterialType.WATER);
    grid.markUpdated(x, y);
    return;
  }

  if (temp > 20) grid.setTemp(x, y, temp - 1);

  const life = grid.getLifetime(x, y);
  const decay = 1;
  if (life <= decay) {
    grid.set(x, y, MaterialType.EMPTY);
    return;
  }
  grid.setLifetime(x, y, life - decay);

  if (Math.random() < 0.8) tryRise(x, y, grid);
  else trySpreadGas(x, y, grid);
});
