import { MaterialType } from './types';
import { registerHandler } from './registry';

// Fraction of temperature difference transferred to each neighbor per tick.
// Low enough that heat builds up visibly before water boils.
// Raised from 0.002 so hot stone (e.g. freshly solidified lava at ~299°C)
// decisively overcomes water's self-cooling and brings adjacent water to
// boiling point in ~1–2 seconds rather than ~23 seconds.
const CONDUCTIVITY = 0.006;

// When stone is adjacent to near-boiling water, endothermic vaporization
// continuously drains heat from stone. This fraction of stone's excess heat
// above 100°C is drained per adjacent near-boiling water cell per tick.
const ENDO_DRAIN_FRACTION = 0.04;
const ENDO_WATER_THRESHOLD = 90;

registerHandler(MaterialType.STONE, (x, y, grid) => {
  const myTemp = grid.getTemp(x, y);
  if (myTemp <= 20) return; // at ambient — nothing to conduct

  // Transfer heat to all 4 orthogonal neighbors, then apply net loss to stone.
  let totalLoss = 0;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx;
    const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;

    const neighborType = grid.get(nx, ny);
    const neighborTemp = grid.getTemp(nx, ny);
    const delta = (myTemp - neighborTemp) * CONDUCTIVITY;
    if (delta > 0) {
      grid.addTemp(nx, ny, delta);
      totalLoss += delta;
    }

    // Endothermic drain: near-boiling water continuously absorbs latent heat
    // from the stone surface, creating a realistic cooling feedback loop.
    if (neighborType === MaterialType.WATER && neighborTemp >= ENDO_WATER_THRESHOLD && myTemp > 100) {
      totalLoss += (myTemp - 100) * ENDO_DRAIN_FRACTION;
    }
  }
  grid.addTemp(x, y, -totalLoss);
});
