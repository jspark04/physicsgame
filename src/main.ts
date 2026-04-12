import './materials/stone';
import './materials/sand';
import './materials/water';
import './materials/oil';

import { Grid } from './simulation/grid';
import { Renderer } from './simulation/renderer';
import { SimulationLoop } from './simulation/loop';
import { MaterialType } from './materials/types';

const GRID_W = 400;
const GRID_H = 300;
const SCALE  = 2;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width  = GRID_W;
canvas.height = GRID_H;
canvas.style.width  = `${GRID_W * SCALE}px`;
canvas.style.height = `${GRID_H * SCALE}px`;

const grid     = new Grid(GRID_W, GRID_H);
const renderer = new Renderer(canvas, grid);
const loop     = new SimulationLoop(grid, renderer);

// Draw a stone border to validate the full pipeline
for (let x = 0; x < GRID_W; x++) {
  grid.set(x, 0,         MaterialType.STONE);
  grid.set(x, GRID_H - 1, MaterialType.STONE);
}
for (let y = 0; y < GRID_H; y++) {
  grid.set(0,         y, MaterialType.STONE);
  grid.set(GRID_W - 1, y, MaterialType.STONE);
}

loop.start();
