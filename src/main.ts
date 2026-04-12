import './materials/index';

import { Grid } from './simulation/grid';
import { Renderer } from './simulation/renderer';
import { SimulationLoop } from './simulation/loop';
import { Sidebar } from './ui/sidebar';
import { Controls } from './ui/controls';
import { StatusBar } from './ui/statusbar';
import { MaterialType } from './materials/types';

const GRID_W = 400;
const GRID_H = 300;
const SCALE  = 2;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width  = GRID_W;
canvas.height = GRID_H;
canvas.style.width  = `${GRID_W * SCALE}px`;
canvas.style.height = `${GRID_H * SCALE}px`;

const grid      = new Grid(GRID_W, GRID_H);
const renderer  = new Renderer(canvas, grid);
const loop      = new SimulationLoop(grid, renderer);
const sidebar   = new Sidebar(document.getElementById('sidebar')!);
const statusBar = new StatusBar(document.getElementById('statusbar')!);
const controls  = new Controls(canvas, grid, loop);

sidebar.onMaterialSelect = (t) => { controls.setMaterial(t); };
sidebar.onPauseToggle    = () => loop.togglePause();
sidebar.onClear          = () => { if (confirm('Clear canvas?')) grid.clear(); };
sidebar.onGravityFlip    = () => { grid.gravityDir = (grid.gravityDir === 1 ? -1 : 1); };
sidebar.onSave           = () => controls.save();
sidebar.onLoad           = (f) => controls.load(f);
sidebar.onBrushChange    = (s) => controls.setBrushSize(s);
sidebar.onSpeedChange    = (m) => loop.setSpeed(m);

loop.onTick = () => statusBar.update(loop.fps, grid.activeCellCount, controls.material, controls.brushSize);

// Stone floor
for (let x = 0; x < GRID_W; x++) grid.set(x, GRID_H - 1, MaterialType.STONE);

loop.start();
