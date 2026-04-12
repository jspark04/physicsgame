import { MaterialType } from './types';
import { registerHandler } from './registry';

const IGNITION_TEMP = 100;
const GROWTH_CHANCE = 0.02;

registerHandler(MaterialType.PLANT, (x, y, grid) => {
  const temp = grid.getTemp(x, y);
  if (temp >= IGNITION_TEMP && Math.random() < 0.12) {
    grid.set(x, y, MaterialType.FIRE);
    grid.setLifetime(x, y, 25 + Math.floor(Math.random() * 25));
    grid.setTemp(x, y, 800);
    grid.markUpdated(x, y);
    return;
  }

  const dirs: [number,number][] = [[0,-1],[0,1],[-1,0],[1,0]];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    const neighbor = grid.get(nx, ny);
    if ((neighbor === MaterialType.EMPTY || neighbor === MaterialType.WATER) && Math.random() < GROWTH_CHANCE) {
      grid.set(nx, ny, MaterialType.PLANT);
      grid.setTemp(nx, ny, grid.getTemp(x, y));
      break;
    }
  }
});
