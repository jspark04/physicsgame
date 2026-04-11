# Falling Sand Game — Design Spec
*Date: 2026-04-11*

---

## Overview

A browser-based falling sand / particle simulator in the spirit of The Powder Toy and Sandspiel. The player selects materials from a sidebar palette and paints them onto a canvas, watching emergent physics and chemistry play out in real time. The aesthetic is dark and technical — a tinkerer's sandbox.

**Target platform:** Web browser (desktop), served as static files  
**Deployment:** Single Docker image (nginx serving Vite build output)  
**Tech stack:** TypeScript + HTML Canvas, bundled with Vite, no UI framework  

---

## Core Architecture

### Grid Representation

The world is a fixed-size 2D grid stored as flat typed arrays for cache efficiency:

- `Uint8Array` — material type per cell (`MaterialType` enum value)
- `Float32Array` — temperature per cell (degrees Celsius, default ~20)
- `Uint8Array` — metadata flags per cell (bit flags: `updatedThisFrame`, `burning`, etc.)
- `Uint8Array` — lifetime counter per cell (used by Fire, Smoke, Steam; 0 = no lifetime tracking)

Default grid size: **400 × 300** cells. Each cell maps to 2×2 screen pixels (rendered at 800×600). Grid dimensions are configurable constants at startup.

Cell indexing: `index = y * width + x` (flat, row-major).

### Update Loop

Each simulation tick:
1. Shuffle column order (randomized left/right to eliminate directional bias)
2. Sweep bottom-up (row `height-1` → row `0`) so falling particles don't get double-updated
3. For each cell: if not `updatedThisFrame`, call the registered material handler
4. After sweep: clear `updatedThisFrame` flags

The `requestAnimationFrame` loop runs at up to 60fps. A speed multiplier (0.25×–4×) controls how many sim ticks run per frame.

### Rendering

A single `ImageData` buffer is maintained in memory. Each frame, every cell writes its RGBA color to the buffer, then one `putImageData()` call draws the frame. No individual `fillRect()` calls.

Each material defines a base color plus an optional per-cell color variation function (e.g. sand gets subtle brightness noise, water shimmers, fire flickers based on temperature).

### Material Handler Registry

Each material registers:
- An **update handler**: `(x: number, y: number, grid: Grid) => void`
- **Metadata**: `{ name, color, density, ignitionTemp, ... }`

The simulation loop calls `registry.getHandler(type)(x, y, grid)` for each cell. The `Grid` API exposes: `get(x, y)`, `set(x, y, type)`, `swap(x1, y1, x2, y2)`, `getTemp(x, y)`, `setTemp(x, y, t)`, `getFlags(x, y)`, `inBounds(x, y)`.

### Reaction Registry

Alongside material handlers, a reaction table handles pairwise material interactions that don't emerge naturally from physics/temperature:

```ts
registerReaction(MaterialType.WATER, MaterialType.LAVA, handler);
registerReaction(MaterialType.ACID,  MaterialType.STONE, handler);
```

Reactions are symmetric (pair is normalized before lookup). Each material handler calls `reactions.check(x, y, nx, ny, grid)` on its neighbors. This keeps new material types fully additive — adding ACID requires only `acid.ts` + reaction registrations, zero edits to existing handlers.

---

## Physics Model

### Movement Classes

| Class | Behavior | Materials |
|---|---|---|
| `SOLID_STATIC` | Never moves | Stone |
| `SOLID_MOVABLE` | Falls straight, slides diagonally on obstruction | Sand, Gunpowder |
| `LIQUID` | Falls, then spreads laterally; displaces lower-density cells | Water, Oil |
| `GAS` | Rises, spreads, decays over lifetime | Fire, Smoke, Steam |

### Density & Displacement

Every material has a `density` value. A particle displaces the cell below it if its density is strictly greater than the cell's density (empty = 0). This gives:
- Oil floats on water (oil density < water density)
- Sand sinks through water (sand density > water density)
- Lava *(future)* displaces water (lava density > water density), producing steam at the interface

No special-case code — all displacement falls out of the density comparison in the movement handler.

### Temperature System

Every cell carries a `float32` temperature. The temperature system drives most inter-material chemistry:

| Interaction | Behavior |
|---|---|
| Fire | Radiates heat to all 8 neighbors each tick |
| Water ≥ 100°C | Converts to Steam |
| Steam | Rises, lifetime decays, disappears |
| Wood / Plant / Oil / Gunpowder above ignition threshold | Catches fire (replaces cell with Fire) |
| Lava *(future material)* | Starts at ~1200°C; slowly cools; below ~600°C becomes Stone |
| Ice *(future material)* | Melts to Water above 0°C; absorbs heat from neighbors |
| Gunpowder ignition | Chain-reacts: fire spreads to adjacent gunpowder cells instantly |

Explicit `registerReaction` pairs handle cases that don't fit temperature (dissolving, catalysis).

### Fire & Smoke Lifetime

Fire and Smoke cells carry a lifetime counter (stored in the metadata byte). Each tick decrements it by 1 plus a small random value. Fire dims as lifetime drops; at 0 it becomes empty. Smoke fades and disappears. Randomness makes fire flicker naturally.

### Gravity

A global `gravityDir: [0 | 1, -1 | 1]` vector controls fall direction (default `[0, 1]` = downward). All movement class handlers receive this as a parameter. Toggling gravity flips `gravityDir[1]` to `-1`.

---

## Materials (v1 — Classic 10)

Grouped by movement class:

**Powders (SOLID_MOVABLE)**
- `SAND` — falls, piles, slides. Density 1.5. Not flammable.
- `GUNPOWDER` — falls, piles. Density 1.4. Ignition temp: 200°C. Chain-explodes: when one cell ignites, all adjacent gunpowder ignites immediately.

**Liquids (LIQUID)**
- `WATER` — flows, fills. Density 1.0. Cools neighbors. Converts to Steam above 100°C. Extinguishes fire on contact.
- `OIL` — flows, floats on water. Density 0.8. Ignition temp: 150°C. Burns slowly.

**Solids (SOLID_STATIC)**
- `STONE` — immovable, inert. Density 3.0. Does not burn. Lava cools into Stone.
- `WOOD` — immovable. Density 2.0. Ignition temp: 250°C. Burns into ash (empty) over time.

**Gases (GAS)**
- `FIRE` — rises, spreads heat, has lifetime (~60–120 ticks with noise). Converts adjacent flammable materials.
- `SMOKE` — rises, drifts. Lifetime ~80–160 ticks. Produced by burning wood/oil/plant.
- `STEAM` — rises fast. Produced when water reaches 100°C. Short lifetime (~40–80 ticks).

**Life**
- `PLANT` — static when placed. Spreads slowly to adjacent empty/water cells (growth tick: ~2% chance per tick per adjacent empty cell). Ignition temp: 100°C. Burns fast, produces smoke.

---

## UI & Controls

### Layout

```
┌─────────────────────────────────────────┐
│ [Sidebar]  │  [Canvas 800×600]          │
│            │                            │
│  POWDERS   │                            │
│  [SAND]    │  (simulation renders here) │
│  [GUNPOW]  │                            │
│            │                            │
│  LIQUIDS   │                            │
│  [WATER]   │                            │
│  [OIL]     │                            │
│            │  ──────────────────────── │
│  SOLIDS    │  FPS: 60  CELLS: 80k       │
│  [STONE]   │  Material: SAND  Brush: 3  │
│  [WOOD]    └───────────────────────────┘
│
│  GASES
│  [FIRE]
│  [SMOKE]
│  [STEAM]
│
│  LIFE
│  [PLANT]
│
│  ──────────
│  [ERASER]
│  ──────────
│  ⏸ Pause
│  🗑 Clear
│  ↕ Gravity
│  💾 Save
│  📂 Load
│  ──────────
│  Brush [===] 3
│  Speed [=] 1x
└────────────
```

### Mouse Input
- **Left drag** — paint selected material
- **Right drag** — erase (set cells to empty)
- **Scroll wheel** — adjust brush size

### Keyboard Shortcuts
- `Space` — pause / resume
- `G` — flip gravity
- `C` — clear canvas (with confirmation)
- `[` / `]` — decrease / increase brush size
- `1`–`9`, `0` — select material by position in palette

### Brush
- Circular brush, radius 1–20 cells
- Paints on mouse drag with interpolation between frames (no gaps at fast drag speeds)

### Save / Load
- Save serializes the `Uint8Array` + `Float32Array` grid state to a binary blob and downloads it as a `.sand` file
- Load reads the file back and restores grid state
- No server required — fully client-side using the File API

---

## Project Structure

```
physicsgame/
├── src/
│   ├── main.ts
│   ├── simulation/
│   │   ├── grid.ts
│   │   ├── loop.ts
│   │   └── renderer.ts
│   ├── materials/
│   │   ├── registry.ts
│   │   ├── reactions.ts
│   │   ├── types.ts
│   │   ├── sand.ts
│   │   ├── water.ts
│   │   ├── fire.ts
│   │   ├── smoke.ts
│   │   ├── gunpowder.ts
│   │   ├── plant.ts
│   │   ├── wood.ts
│   │   ├── oil.ts
│   │   ├── steam.ts
│   │   └── stone.ts
│   └── ui/
│       ├── sidebar.ts
│       ├── controls.ts
│       └── statusbar.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
├── nginx.conf
└── .gitignore
```

---

## Deployment

### Dockerfile (two-stage)

**Stage 1 — Build:**
- Base: `node:22-alpine`
- Install deps, run `vite build` → `/dist`

**Stage 2 — Serve:**
- Base: `nginx:alpine`
- Copy `/dist` from build stage
- Serve on port 80
- `nginx.conf`: serves `index.html` for all routes, gzip enabled, cache headers for static assets

**Run:**
```bash
docker build -t physicsgame .
docker run -p 8080:80 physicsgame
# open http://localhost:8080
```

---

## Future Extension Points

The architecture is designed to accommodate:
- **New materials** — add `materials/acid.ts`, register handler + reactions, done
- **WebAssembly hot path** — the `grid.ts` + material handlers are isolated; the simulation loop can be extracted to a WASM module without touching the UI layer
- **Multiplayer / shared canvas** — the grid state is a plain typed array, straightforward to sync over WebSocket
- **Chunked simulation** — the update loop can be wrapped with dirty-chunk tracking without changing material handler signatures
- **Temperature visualization overlay** — renderer can optionally draw a heat map over the simulation
