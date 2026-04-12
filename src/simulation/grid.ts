import { MaterialType, getDensity } from '../materials/types';

export class Grid {
  readonly width: number;
  readonly height: number;
  gravityDir: 1 | -1 = 1;

  private cells: Uint8Array;
  private temps: Float32Array;
  private lifetimes: Uint8Array;
  private updated: Uint8Array;
  private _activeCount = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const n = width * height;
    this.cells    = new Uint8Array(n);
    this.temps    = new Float32Array(n).fill(20);
    this.lifetimes = new Uint8Array(n);
    this.updated  = new Uint8Array(n);
  }

  get activeCellCount(): number { return this._activeCount; }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x: number, y: number): MaterialType {
    if (!this.inBounds(x, y)) return MaterialType.EMPTY;
    return this.cells[y * this.width + x] as MaterialType;
  }

  set(x: number, y: number, type: MaterialType): void {
    if (!this.inBounds(x, y)) return;
    const i = y * this.width + x;
    const prev = this.cells[i] as MaterialType;
    if (prev !== MaterialType.EMPTY && type === MaterialType.EMPTY) this._activeCount--;
    if (prev === MaterialType.EMPTY && type !== MaterialType.EMPTY) this._activeCount++;
    this.cells[i] = type;
  }

  swap(x1: number, y1: number, x2: number, y2: number): void {
    if (!this.inBounds(x1, y1) || !this.inBounds(x2, y2)) return;
    const i1 = y1 * this.width + x1;
    const i2 = y2 * this.width + x2;
    let t = this.cells[i1];   this.cells[i1]    = this.cells[i2];    this.cells[i2]    = t;
    let f = this.temps[i1];   this.temps[i1]    = this.temps[i2];    this.temps[i2]    = f;
    let l = this.lifetimes[i1]; this.lifetimes[i1] = this.lifetimes[i2]; this.lifetimes[i2] = l;
    this.updated[i1] = 1;
    this.updated[i2] = 1;
  }

  getTemp(x: number, y: number): number {
    if (!this.inBounds(x, y)) return 20;
    return this.temps[y * this.width + x];
  }

  setTemp(x: number, y: number, temp: number): void {
    if (!this.inBounds(x, y)) return;
    this.temps[y * this.width + x] = temp;
  }

  addTemp(x: number, y: number, delta: number): void {
    if (!this.inBounds(x, y)) return;
    this.temps[y * this.width + x] += delta;
  }

  getLifetime(x: number, y: number): number {
    if (!this.inBounds(x, y)) return 0;
    return this.lifetimes[y * this.width + x];
  }

  setLifetime(x: number, y: number, value: number): void {
    if (!this.inBounds(x, y)) return;
    this.lifetimes[y * this.width + x] = Math.max(0, Math.min(255, value));
  }

  isUpdated(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    return this.updated[y * this.width + x] !== 0;
  }

  markUpdated(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    this.updated[y * this.width + x] = 1;
  }

  clearUpdatedFlags(): void { this.updated.fill(0); }

  getDensity(x: number, y: number): number { return getDensity(this.get(x, y)); }

  clear(): void {
    this.cells.fill(0);
    this.temps.fill(20);
    this.lifetimes.fill(0);
    this.updated.fill(0);
    this._activeCount = 0;
  }

  serialize(): Uint8Array {
    const n = this.width * this.height;
    const out = new Uint8Array(8 + n + n * 4 + n);
    const view = new DataView(out.buffer);
    view.setUint32(0, this.width, true);
    view.setUint32(4, this.height, true);
    let off = 8;
    out.set(this.cells, off); off += n;
    out.set(new Uint8Array(this.temps.buffer, this.temps.byteOffset, n * 4), off); off += n * 4;
    out.set(this.lifetimes, off);
    return out;
  }

  deserialize(data: Uint8Array): void {
    const view = new DataView(data.buffer, data.byteOffset);
    const w = view.getUint32(0, true);
    const h = view.getUint32(4, true);
    if (w !== this.width || h !== this.height) throw new Error(`Size mismatch: ${w}x${h}`);
    const n = this.width * this.height;
    let off = 8;
    this.cells.set(data.subarray(off, off + n)); off += n;
    const MATERIAL_MAX = 10; // update if MaterialType enum changes
    for (let i = 0; i < n; i++) {
      if (this.cells[i] > MATERIAL_MAX) this.cells[i] = 0;
    }
    new Uint8Array(this.temps.buffer, this.temps.byteOffset, n * 4).set(data.subarray(off, off + n * 4)); off += n * 4;
    this.lifetimes.set(data.subarray(off, off + n));
    this.updated.fill(0);
    this._activeCount = 0;
    for (let i = 0; i < n; i++) {
      if (this.cells[i] !== MaterialType.EMPTY) this._activeCount++;
    }
  }
}
