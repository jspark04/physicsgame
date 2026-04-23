import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';

const COOL_TEMP = 300;

registerHandler(MaterialType.LAVA, (x, y, grid) => {
  // Cool to stone when cold enough
  if (grid.getTemp(x, y) < COOL_TEMP) {
    grid.set(x, y, MaterialType.STONE);
    grid.markUpdated(x, y);
    return;
  }

  // Bidirectional heat conduction to material neighbours.
  // Lava loses heat proportional to the temperature difference — cold
  // neighbours (snow, water, ice) actively pull heat from lava rather
  // than receiving one-way radiation that costs lava nothing.
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (!grid.inBounds(nx, ny) || grid.get(nx, ny) === MaterialType.EMPTY) continue;
      const diff = grid.getTemp(x, y) - grid.getTemp(nx, ny);
      if (diff <= 0) continue;
      const xfer = Math.min(diff * 0.003, 5); // conductivity coefficient
      grid.addTemp(nx, ny, xfer);
      grid.addTemp(x, y, -xfer);
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

  // Passive ambient cooling (baseline for open air) and slow flow.
  // Kept small so isolated/interior lava cells stay molten for tens of
  // seconds — active quenching (snow, water, ice conduction) does the
  // heavy lifting via the bidirectional exchange above.
  grid.addTemp(x, y, -0.3);
  if (!tryFall(x, y, grid)) {
    if (Math.random() < 0.3) tryFlow(x, y, grid, 2);
  }
});
