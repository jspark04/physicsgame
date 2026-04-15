import { MaterialType } from './types';
import { registerHandler } from './registry';

const IGNITION_TEMP = 150;
const BLAST_RADIUS  = 7;
const CLEAR_RADIUS  = 4;

// These materials survive explosions
const INDESTRUCTIBLE = new Set<MaterialType>([
  MaterialType.WATER_SOURCE,
  MaterialType.FIRE_SOURCE,
]);

registerHandler(MaterialType.TNT, (x, y, grid) => {
  if (grid.getTemp(x, y) < IGNITION_TEMP) return;

  // Explosion
  for (let edy = -BLAST_RADIUS; edy <= BLAST_RADIUS; edy++) {
    for (let edx = -BLAST_RADIUS; edx <= BLAST_RADIUS; edx++) {
      const dist = Math.sqrt(edx * edx + edy * edy);
      if (dist > BLAST_RADIUS) continue;
      const ex = x + edx; const ey = y + edy;
      if (!grid.inBounds(ex, ey)) continue;

      // Heat pulse — closer cells get more heat (applied to ALL cells including indestructible)
      const heatAmount = Math.round((BLAST_RADIUS - dist) * 120);

      const cell = grid.get(ex, ey);
      if (INDESTRUCTIBLE.has(cell)) {
        grid.addTemp(ex, ey, heatAmount);
        continue;
      }

      if (dist <= CLEAR_RADIUS) {
        // Blast core: clear everything
        grid.set(ex, ey, MaterialType.EMPTY);
        grid.setTemp(ex, ey, 20);
        grid.markUpdated(ex, ey);
      } else if (cell === MaterialType.GLASS) {
        // Shockwave shatters glass into sand in the outer ring
        grid.set(ex, ey, MaterialType.SAND);
        grid.markUpdated(ex, ey);
      } else if (cell === MaterialType.EMPTY && Math.random() < 0.5) {
        // Blast ring: scatter fire
        grid.set(ex, ey, MaterialType.FIRE);
        grid.setLifetime(ex, ey, 20 + Math.floor(Math.random() * 31));
        grid.setTemp(ex, ey, 1200);
        grid.markUpdated(ex, ey);
      }

      // Add heat on top of the blast effects
      grid.addTemp(ex, ey, heatAmount);
    }
  }

  // Remove self
  grid.set(x, y, MaterialType.EMPTY);
  grid.setTemp(x, y, 20);
  grid.markUpdated(x, y);
});
