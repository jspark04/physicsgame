import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.STONE, (_x, _y, _grid) => {
  // Stone is static — never moves
});
