import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryRise, trySpreadGas } from './movement';

registerHandler(MaterialType.STEAM, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Condense back to water only when genuinely cold
  if (temp < 35 && Math.random() < 0.005) {
    grid.set(x, y, MaterialType.WATER);
    grid.setTemp(x, y, 30);
    grid.markUpdated(x, y);
    // Exothermic: condensation releases latent heat to neighbours
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
      grid.addTemp(x + dx, y + dy, 10);
    }
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
