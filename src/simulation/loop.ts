import { MaterialType } from '../materials/types';
import { getHandler } from '../materials/registry';
import type { Grid } from './grid';
import type { Renderer } from './renderer';

export class SimulationLoop {
  fps = 0;
  paused = false;
  onTick?: () => void;

  private speedMultiplier = 1;
  private accumulator = 0;
  private readonly tickMs = 1000 / 60;
  private lastTime = 0;
  private rafId = 0;
  private fpsAcc = 0;
  private fpsFrames = 0;

  constructor(private grid: Grid, private renderer: Renderer) {}

  start(): void {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void { cancelAnimationFrame(this.rafId); }
  togglePause(): void { this.paused = !this.paused; }
  setSpeed(multiplier: number): void { this.speedMultiplier = multiplier; }

  private frame = (now: number): void => {
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.fpsAcc += delta;
    this.fpsFrames++;
    if (this.fpsAcc >= 500) {
      this.fps = Math.round(this.fpsFrames / (this.fpsAcc / 1000));
      this.fpsAcc = 0;
      this.fpsFrames = 0;
    }

    if (!this.paused) {
      this.accumulator += delta * this.speedMultiplier;
      let ticks = 0;
      while (this.accumulator >= this.tickMs && ticks < 8) {
        this.tick();
        this.accumulator -= this.tickMs;
        ticks++;
      }
      if (this.accumulator > this.tickMs * 2) this.accumulator = 0;
    }

    this.renderer.render();
    this.onTick?.();
    this.rafId = requestAnimationFrame(this.frame);
  };

  private tick(): void {
    const { width, height } = this.grid;

    // Shuffle columns to eliminate directional bias
    const cols = Array.from({ length: width }, (_, i) => i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = cols[i]; cols[i] = cols[j]; cols[j] = tmp;
    }

    // Sweep in gravity direction (bottom-up for normal gravity)
    const startY = this.grid.gravityDir === 1 ? height - 1 : 0;
    const endY   = this.grid.gravityDir === 1 ? -1 : height;
    const stepY  = this.grid.gravityDir === 1 ? -1 : 1;

    for (let y = startY; y !== endY; y += stepY) {
      for (const x of cols) {
        if (this.grid.isUpdated(x, y)) continue;
        const type = this.grid.get(x, y);
        if (type === MaterialType.EMPTY) continue;
        getHandler(type)?.(x, y, this.grid);
      }
    }

    this.grid.clearUpdatedFlags();
  }
}
