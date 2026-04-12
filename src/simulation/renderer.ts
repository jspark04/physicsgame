import { MaterialType, MATERIAL_META } from '../materials/types';
import type { Grid } from './grid';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private buf: Uint8ClampedArray;

  constructor(canvas: HTMLCanvasElement, private grid: Grid) {
    this.ctx = canvas.getContext('2d')!;
    this.imageData = this.ctx.createImageData(grid.width, grid.height);
    this.buf = this.imageData.data;
  }

  render(): void {
    const { width, height } = this.grid;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const type     = this.grid.get(x, y);
        const lifetime = this.grid.getLifetime(x, y);
        const [r, g, b] = this.cellColor(type, lifetime);
        const i = (y * width + x) * 4;
        this.buf[i]     = r;
        this.buf[i + 1] = g;
        this.buf[i + 2] = b;
        this.buf[i + 3] = 255;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  private cellColor(type: MaterialType, lifetime: number): [number, number, number] {
    const meta = MATERIAL_META[type];
    if (!meta) return [20, 20, 20]; // fallback for invalid types
    const base = meta.baseColor;
    const n = () => Math.floor((Math.random() - 0.5) * 18);

    switch (type) {
      case MaterialType.FIRE: {
        const ratio = Math.min(lifetime / 120, 1);
        return [Math.min(255, 200 + Math.floor(ratio * 55)), Math.min(255, Math.floor(ratio * 140)), 0];
      }
      case MaterialType.SMOKE: {
        const v = Math.max(40, Math.floor(60 + (lifetime / 160) * 60));
        return [v, v, v];
      }
      case MaterialType.STEAM: {
        const a = Math.max(120, Math.floor(140 + (lifetime / 80) * 60));
        return [a, a + 8, a + 20];
      }
      case MaterialType.SAND: {
        const d = n();
        return [base[0] + d, base[1] + d, base[2] + d];
      }
      case MaterialType.WATER: {
        const d = n();
        return [Math.max(0, base[0] + d), Math.max(0, base[1] + d), Math.min(255, base[2] + d)];
      }
      default:
        return [base[0], base[1], base[2]];
    }
  }
}
