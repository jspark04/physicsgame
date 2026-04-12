import { MaterialType } from './types';
import { registerReaction } from './reactions';

// Water extinguishes fire
registerReaction(MaterialType.WATER, MaterialType.FIRE, (ax, ay, bx, by, grid) => {
  const aIsFire = grid.get(ax, ay) === MaterialType.FIRE;
  const fireX = aIsFire ? ax : bx;
  const fireY = aIsFire ? ay : by;
  const waterX = aIsFire ? bx : ax;
  const waterY = aIsFire ? by : ay;
  grid.set(fireX, fireY, MaterialType.EMPTY);
  grid.setTemp(fireX, fireY, 20);
  grid.setTemp(waterX, waterY, Math.max(20, grid.getTemp(waterX, waterY) - 15));
});
