import { MaterialType } from '../materials/types';
import type { Grid } from '../simulation/grid';
import type { SimulationLoop } from '../simulation/loop';

export class Controls {
  material: MaterialType = MaterialType.SAND;
  brushSize = 3;
  onMaterialChange?: (t: MaterialType) => void;

  private painting = false;
  private erasing  = false;
  private lastGX   = -1;
  private lastGY   = -1;

  constructor(
    private canvas: HTMLCanvasElement,
    private grid: Grid,
    private loop: SimulationLoop,
  ) {
    this.bindMouse();
    this.bindKeyboard();
  }

  setMaterial(type: MaterialType): void { this.material = type; }
  setBrushSize(size: number): void { this.brushSize = Math.max(1, Math.min(20, size)); }

  tick(): void {
    if (this.painting && this.lastGX >= 0) {
      this.paint(this.lastGX, this.lastGY, this.erasing);
    }
  }

  private toGrid(clientX: number, clientY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    return [
      Math.floor((clientX - rect.left) * this.grid.width  / rect.width),
      Math.floor((clientY - rect.top)  * this.grid.height / rect.height),
    ];
  }

  private paint(gx: number, gy: number, erase: boolean): void {
    const type = erase ? MaterialType.EMPTY : this.material;
    const r = this.brushSize;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (!this.grid.inBounds(nx, ny)) continue;
        this.grid.set(nx, ny, type);
        this.grid.setTemp(nx, ny, 20); // reset temperature — prevents hot-cell ghost state
        this.grid.setLifetime(nx, ny, 0);
        if (type === MaterialType.FIRE)  { this.grid.setLifetime(nx, ny, 80 + Math.floor(Math.random() * 40)); this.grid.setTemp(nx, ny, 900); }
        if (type === MaterialType.SMOKE) { this.grid.setLifetime(nx, ny, 100 + Math.floor(Math.random() * 60)); }
        if (type === MaterialType.STEAM) { this.grid.setLifetime(nx, ny, 600 + Math.floor(Math.random() * 600)); }
      }
    }
  }

  private interpolate(x0: number, y0: number, x1: number, y1: number, erase: boolean): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.paint(Math.round(x0 + dx * t), Math.round(y0 + dy * t), erase);
    }
  }

  private bindMouse(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.painting = true;
      this.erasing  = e.button === 2;
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);
      this.paint(gx, gy, this.erasing);
      this.lastGX = gx; this.lastGY = gy;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.painting) return;
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);
      this.interpolate(this.lastGX, this.lastGY, gx, gy, this.erasing);
      this.lastGX = gx; this.lastGY = gy;
    });
    const stop = () => { this.painting = false; };
    this.canvas.addEventListener('mouseup', stop);
    this.canvas.addEventListener('mouseleave', stop);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.setBrushSize(this.brushSize + (e.deltaY < 0 ? 1 : -1));
    }, { passive: false });
  }

  private bindKeyboard(): void {
    const PALETTE = [
      MaterialType.SAND, MaterialType.WATER, MaterialType.FIRE,
      MaterialType.SMOKE, MaterialType.GUNPOWDER, MaterialType.PLANT,
      MaterialType.WOOD, MaterialType.OIL, MaterialType.STEAM, MaterialType.STONE,
    ];
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.loop.togglePause();
          break;
        case '[': this.setBrushSize(this.brushSize - 1); break;
        case ']': this.setBrushSize(this.brushSize + 1); break;
        case 'g': case 'G':
          this.grid.gravityDir = (this.grid.gravityDir === 1 ? -1 : 1);
          break;
        default: {
          const n = parseInt(e.key, 10);
          if (!isNaN(n) && n >= 1 && n <= PALETTE.length) {
            this.material = PALETTE[n - 1];
            this.onMaterialChange?.(this.material);
          }
        }
      }
    });
  }

  save(): void {
    const data = this.grid.serialize();
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sandbox-${Date.now()}.sand`;
    a.click();
    URL.revokeObjectURL(url);
  }

  load(file: File): void {
    file.arrayBuffer().then((buf) => {
      try {
        this.grid.deserialize(new Uint8Array(buf));
      } catch (err) {
        console.error('Failed to load save:', err);
        alert('Could not load file — wrong grid size or corrupt data.');
      }
    });
  }
}
