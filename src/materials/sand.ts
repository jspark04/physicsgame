import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

registerHandler(MaterialType.SAND, (x, y, grid) => {
  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
