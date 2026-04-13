import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';
import { checkReaction } from './reactions';

registerHandler(MaterialType.WATER, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp >= 100) {
    grid.set(x, y, MaterialType.STEAM);
    grid.setLifetime(x, y, 600 + Math.floor(Math.random() * 600));
    grid.setTemp(x, y, 100);
    grid.markUpdated(x, y);
    return;
  }

  if (temp > 20) grid.setTemp(x, y, temp - 0.5);

  // Extinguish adjacent fire
  for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]] as [number,number][]) {
    if (grid.inBounds(x+dx, y+dy) && grid.get(x+dx, y+dy) === MaterialType.FIRE) {
      checkReaction(x, y, x+dx, y+dy, grid);
      return;
    }
  }

  if (!tryFall(x, y, grid)) tryFlow(x, y, grid);
});
