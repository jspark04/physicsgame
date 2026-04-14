import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';

const COOL_TEMP = 300;

registerHandler(MaterialType.LAVA, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Cool to stone when cold enough
  if (temp < COOL_TEMP) {
    grid.set(x, y, MaterialType.STONE);
    grid.setTemp(x, y, temp);
    grid.markUpdated(x, y);
    return;
  }

  // Radiate heat to all 8 neighbours
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      grid.addTemp(x + dx, y + dy, 15 + Math.random() * 15);
    }
  }

  // Flash-vaporise adjacent water
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    if (grid.get(nx, ny) === MaterialType.WATER) {
      grid.set(nx, ny, MaterialType.STEAM);
      grid.setLifetime(nx, ny, 300 + Math.floor(Math.random() * 300));
      grid.setTemp(nx, ny, 100);
      grid.markUpdated(nx, ny);
      grid.addTemp(x, y, -200); // lava cools from contact
      break;
    }
  }

  // Passive cooling and slow flow
  const postTemp = grid.getTemp(x, y);
  grid.setTemp(x, y, Math.max(COOL_TEMP, postTemp - 0.5));
  if (!tryFall(x, y, grid)) {
    if (Math.random() < 0.3) tryFlow(x, y, grid, 2);
  }
});
