import { MaterialType } from '../materials/types';
import type { Grid } from '../simulation/grid';
import type { SimulationLoop } from '../simulation/loop';
export class Controls {
  material = MaterialType.SAND;
  brushSize = 3;
  constructor(_canvas: HTMLCanvasElement, _grid: Grid, _loop: SimulationLoop) {}
  setMaterial(t: MaterialType) { this.material = t; }
  setBrushSize(s: number) { this.brushSize = s; }
  save() {}
  load(_f: File) {}
}
