import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryRise, trySpreadGas } from './movement';

registerHandler(MaterialType.FIRE, (x, y, grid) => {
  // Radiate heat to all 8 neighbors
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      grid.addTemp(x + dx, y + dy, 40 + Math.random() * 40);
    }
  }

  const life = grid.getLifetime(x, y);
  const decay = 1 + Math.floor(Math.random() * 3);
  if (life <= decay) {
    grid.set(x, y, MaterialType.EMPTY);
    grid.setTemp(x, y, 20);
    return;
  }
  grid.setLifetime(x, y, life - decay);

  if (Math.random() < 0.7) tryRise(x, y, grid);
  else trySpreadGas(x, y, grid);
});
