import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySpread } from './movement';

const OIL_IGNITION_TEMP = 150;
const SURFACE_SPREAD_DIST = 5;

registerHandler(MaterialType.OIL, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp >= OIL_IGNITION_TEMP && Math.random() < 0.05) {
    grid.set(x, y, MaterialType.FIRE);
    grid.setLifetime(x, y, 60 + Math.floor(Math.random() * 60));
    grid.setTemp(x, y, 900);
    grid.markUpdated(x, y);
    return;
  }

  if (tryFall(x, y, grid)) return;
  if (trySpread(x, y, grid)) return;

  // Surface spread: when floating on water, scan laterally and displace water cells
  // so oil fans out into a flat layer instead of staying as a spike.
  const by = y + grid.gravityDir;
  if (!grid.inBounds(x, by) || grid.get(x, by) !== MaterialType.WATER) return;

  const dirs = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const dx of dirs) {
    let best = -1;
    for (let dist = 1; dist <= SURFACE_SPREAD_DIST; dist++) {
      const nx = x + dx * dist;
      if (!grid.inBounds(nx, y)) break;
      const cell = grid.get(nx, y);
      if (cell === MaterialType.EMPTY) { best = nx; break; }
      if (cell === MaterialType.WATER && grid.inBounds(nx, by) && grid.get(nx, by) === MaterialType.WATER) {
        best = nx; // surface water — can push aside; keep scanning for empty slot
      } else {
        break;
      }
    }
    if (best !== -1) { grid.swap(x, y, best, y); return; }
  }
});
