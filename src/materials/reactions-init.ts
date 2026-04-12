import { MaterialType } from './types';
import { registerReaction } from './reactions';

// Water extinguishes fire
registerReaction(MaterialType.WATER, MaterialType.FIRE, (ax, ay, bx, by, grid) => {
  const fireX = grid.get(ax, ay) === MaterialType.FIRE ? ax : bx;
  const fireY = grid.get(ax, ay) === MaterialType.FIRE ? ay : by;
  const waterX = fireX === ax ? bx : ax;
  const waterY = fireY === ay ? by : ay;
  grid.set(fireX, fireY, MaterialType.EMPTY);
  grid.setTemp(fireX, fireY, 20);
  grid.setTemp(waterX, waterY, Math.max(20, grid.getTemp(waterX, waterY) - 15));
});
