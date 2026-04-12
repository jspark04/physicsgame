import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryRise, trySpreadGas } from './movement';

registerHandler(MaterialType.SMOKE, (x, y, grid) => {
  const life = grid.getLifetime(x, y);
  const decay = 1 + Math.floor(Math.random() * 2);
  if (life <= decay) {
    grid.set(x, y, MaterialType.EMPTY);
    return;
  }
  grid.setLifetime(x, y, life - decay);
  if (Math.random() < 0.6) tryRise(x, y, grid);
  else trySpreadGas(x, y, grid);
});
