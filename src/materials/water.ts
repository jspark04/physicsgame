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

  // Diffuse salinity (stored in lifetime) to neighbouring water cells
  const salinity = grid.getLifetime(x, y);
  if (salinity > 0 && Math.random() < 0.1) {
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]] as [number,number][];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.WATER) {
        const ns = grid.getLifetime(nx, ny);
        if (ns < salinity) {
          grid.setLifetime(x, y, salinity - 1);
          grid.setLifetime(nx, ny, ns + 1);
          break;
        }
      }
    }
  }

  // Extinguish adjacent fire
  for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]] as [number,number][]) {
    if (grid.inBounds(x+dx, y+dy) && grid.get(x+dx, y+dy) === MaterialType.FIRE) {
      checkReaction(x, y, x+dx, y+dy, grid);
      return;
    }
  }

  if (!tryFall(x, y, grid)) tryFlow(x, y, grid);
});
