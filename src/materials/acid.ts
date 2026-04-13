import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';

const DISSOLVABLE = new Set<MaterialType>([
  MaterialType.SAND, MaterialType.STONE, MaterialType.WOOD,
  MaterialType.PLANT, MaterialType.ICE, MaterialType.SNOW,
  MaterialType.SALT, MaterialType.GUNPOWDER,
]);

registerHandler(MaterialType.ACID, (x, y, grid) => {
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    const neighbor = grid.get(nx, ny);

    // Neutralised by water
    if (neighbor === MaterialType.WATER && Math.random() < 0.15) {
      grid.set(x, y, MaterialType.WATER);
      grid.markUpdated(x, y);
      return;
    }

    // Dissolve one neighbour per tick
    if (DISSOLVABLE.has(neighbor) && Math.random() < 0.02) {
      grid.set(nx, ny, MaterialType.EMPTY);
      grid.setTemp(nx, ny, 20);
      break;
    }
  }

  if (!tryFall(x, y, grid)) tryFlow(x, y, grid);
});
