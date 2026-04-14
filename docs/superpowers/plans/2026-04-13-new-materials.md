# New Materials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 new materials (Ice, Lava, Acid, Salt, Snow, Glass, TNT, Water Source, Fire Source) and wire them into the sidebar and controls.

**Architecture:** Each material gets its own handler file following the existing pattern (`registerHandler` + physics logic). Types and metadata are centralized in `types.ts`. All new types are added to sidebar groups and the controls palette. Sand gains a high-temp glass-formation transform. The renderer gains flicker cases for Lava, Ice, and Snow.

**Tech Stack:** TypeScript, Vite, Vitest — same as the existing codebase. No new dependencies.

---

## Codebase Context

Key files and patterns to understand:

- **`src/materials/types.ts`** — `MaterialType` enum (EMPTY=0 … STONE=10) and `MATERIAL_META` record (name, density, baseColor, flammable, ignitionTemp). Add new enum values here first.
- **`src/materials/registry.ts`** — `registerHandler(type, fn)` / `getHandler(type)`. Every material that needs per-tick behavior calls `registerHandler`. Static materials (no physics) need no handler at all.
- **`src/materials/movement.ts`** — `tryFall`, `trySlide`, `tryFlow`, `tryRise`, `trySpreadGas`. Liquids use `tryFall + tryFlow`, powders use `tryFall + trySlide`.
- **`src/simulation/grid.ts`** — `Grid` class. Key methods: `get/set`, `getTemp/setTemp/addTemp`, `getLifetime/setLifetime`, `inBounds`, `markUpdated`, `swap`, `getDensity`. Lifetimes are `Uint16Array` (max 65535).
- **`src/materials/index.ts`** — imports all handler files. Add new imports here.
- **`src/ui/sidebar.ts`** — `GROUPS` array drives the material palette. Add new types to existing or new groups.
- **`src/ui/controls.ts`** — `paint()` sets material-specific temp/lifetime. `PALETTE` array maps keyboard keys 1–N to materials.
- **`src/simulation/renderer.ts`** — `cellColor()` switch. Default case returns `base` color. Add cases for animated/flickering materials.

**Density reference** (higher = sinks through lower):
```
STONE=3.0, WOOD=2.0, SAND=1.5, WATER=1.0, OIL=0.8, FIRE=0.01
```

## File Structure

**Create:**
- `src/materials/ice.ts` + `src/materials/ice.test.ts`
- `src/materials/lava.ts` + `src/materials/lava.test.ts`
- `src/materials/acid.ts` + `src/materials/acid.test.ts`
- `src/materials/salt.ts` + `src/materials/salt.test.ts`
- `src/materials/snow.ts` + `src/materials/snow.test.ts`
- `src/materials/tnt.ts` + `src/materials/tnt.test.ts`
- `src/materials/water_source.ts` + `src/materials/water_source.test.ts`
- `src/materials/fire_source.ts` + `src/materials/fire_source.test.ts`

**Modify:**
- `src/materials/types.ts` — add 9 new enum values + MATERIAL_META entries
- `src/materials/sand.ts` — add glass-formation transform at >800°C
- `src/materials/index.ts` — import new handler files
- `src/ui/sidebar.ts` — add new types to GROUPS
- `src/ui/controls.ts` — add LAVA to paint() hot-start logic; add all new types to PALETTE
- `src/simulation/renderer.ts` — add Lava, Ice, Snow color animation cases

---

## Task 1: Extend types.ts

**Files:**
- Modify: `src/materials/types.ts`

- [ ] **Step 1: Add enum values and metadata**

Replace the contents of `src/materials/types.ts` with:

```typescript
export enum MaterialType {
  EMPTY        = 0,
  SAND         = 1,
  WATER        = 2,
  FIRE         = 3,
  SMOKE        = 4,
  GUNPOWDER    = 5,
  PLANT        = 6,
  WOOD         = 7,
  OIL          = 8,
  STEAM        = 9,
  STONE        = 10,
  ICE          = 11,
  LAVA         = 12,
  ACID         = 13,
  SALT         = 14,
  SNOW         = 15,
  GLASS        = 16,
  TNT          = 17,
  WATER_SOURCE = 18,
  FIRE_SOURCE  = 19,
}

export interface MaterialMeta {
  readonly name: string;
  readonly density: number;
  readonly baseColor: readonly [number, number, number];
  readonly flammable: boolean;
  readonly ignitionTemp: number;
}

export const MATERIAL_META: Readonly<Record<MaterialType, MaterialMeta>> = {
  [MaterialType.EMPTY]:        { name: 'Empty',        density: 0,   baseColor: [5,   5,   8],   flammable: false, ignitionTemp: Infinity },
  [MaterialType.SAND]:         { name: 'Sand',         density: 1.5, baseColor: [194, 160, 110], flammable: false, ignitionTemp: Infinity },
  [MaterialType.WATER]:        { name: 'Water',        density: 1.0, baseColor: [58,  143, 199], flammable: false, ignitionTemp: Infinity },
  [MaterialType.FIRE]:         { name: 'Fire',         density: 0.01,baseColor: [255, 106, 0],   flammable: false, ignitionTemp: Infinity },
  [MaterialType.SMOKE]:        { name: 'Smoke',        density: 0.01,baseColor: [100, 100, 100], flammable: false, ignitionTemp: Infinity },
  [MaterialType.GUNPOWDER]:    { name: 'Gunpowder',    density: 1.4, baseColor: [60,  60,  60],  flammable: true,  ignitionTemp: 200 },
  [MaterialType.PLANT]:        { name: 'Plant',        density: 1.8, baseColor: [58,  125, 68],  flammable: true,  ignitionTemp: 100 },
  [MaterialType.WOOD]:         { name: 'Wood',         density: 2.0, baseColor: [139, 94,  60],  flammable: true,  ignitionTemp: 250 },
  [MaterialType.OIL]:          { name: 'Oil',          density: 0.8, baseColor: [200, 180, 50],  flammable: true,  ignitionTemp: 150 },
  [MaterialType.STEAM]:        { name: 'Steam',        density: 0.02,baseColor: [176, 196, 222], flammable: false, ignitionTemp: Infinity },
  [MaterialType.STONE]:        { name: 'Stone',        density: 3.0, baseColor: [120, 120, 120], flammable: false, ignitionTemp: Infinity },
  [MaterialType.ICE]:          { name: 'Ice',          density: 2.5, baseColor: [173, 216, 230], flammable: false, ignitionTemp: Infinity },
  [MaterialType.LAVA]:         { name: 'Lava',         density: 2.0, baseColor: [255, 80,  0],   flammable: false, ignitionTemp: Infinity },
  [MaterialType.ACID]:         { name: 'Acid',         density: 1.1, baseColor: [120, 255, 50],  flammable: false, ignitionTemp: Infinity },
  [MaterialType.SALT]:         { name: 'Salt',         density: 1.5, baseColor: [240, 240, 240], flammable: false, ignitionTemp: Infinity },
  [MaterialType.SNOW]:         { name: 'Snow',         density: 1.3, baseColor: [230, 240, 255], flammable: false, ignitionTemp: Infinity },
  [MaterialType.GLASS]:        { name: 'Glass',        density: 2.5, baseColor: [180, 210, 220], flammable: false, ignitionTemp: Infinity },
  [MaterialType.TNT]:          { name: 'TNT',          density: 2.2, baseColor: [220, 50,  50],  flammable: true,  ignitionTemp: 150 },
  [MaterialType.WATER_SOURCE]: { name: 'Water Source', density: 5.0, baseColor: [0,   100, 200], flammable: false, ignitionTemp: Infinity },
  [MaterialType.FIRE_SOURCE]:  { name: 'Fire Source',  density: 5.0, baseColor: [200, 60,  0],   flammable: false, ignitionTemp: Infinity },
};

export function getDensity(type: MaterialType): number {
  return MATERIAL_META[type].density;
}
```

- [ ] **Step 2: Verify types.ts compiles**

```bash
cd D:/Repos/physicsgame && npx tsc --noEmit 2>&1 | head -20
```

Expected: zero errors (or only errors about missing handler files, which don't exist yet).

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
npm test -- --run
```

Expected: all 86 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/materials/types.ts
git commit -m "feat: add 9 new material types to enum and MATERIAL_META"
```

---

## Task 2: Ice

Ice is a cold solid that melts into water when warm. It slowly chills adjacent cells.

**Files:**
- Create: `src/materials/ice.ts`
- Create: `src/materials/ice.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/ice.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './ice';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.ICE)!(x, y, g);

describe('updateIce', () => {
  it('melts to water when temp > 5 (probabilistic — 500 tries)', () => {
    let melted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ICE);
      g.setTemp(2, 2, 50);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER) { melted = true; break; }
    }
    expect(melted).toBe(true);
  });

  it('does not melt when temp <= 5', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ICE);
    g.setTemp(2, 2, 3);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.ICE);
  });

  it('absorbs heat from neighbors when melting', () => {
    let absorbed = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ICE);
      g.setTemp(2, 2, 50);
      g.set(2, 1, MaterialType.STONE);
      g.setTemp(2, 1, 80);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER && g.getTemp(2, 1) < 80) { absorbed = true; break; }
    }
    expect(absorbed).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/ice.test.ts 2>&1 | tail -10
```

Expected: FAIL (ice.ts not found).

- [ ] **Step 3: Implement ice.ts**

Create `src/materials/ice.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.ICE, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Passively stay cold
  if (temp > 0) grid.setTemp(x, y, temp - 0.3);

  // Melt to water when warm enough
  if (temp > 5 && Math.random() < 0.02) {
    grid.set(x, y, MaterialType.WATER);
    grid.setTemp(x, y, Math.max(0, temp - 50));
    grid.markUpdated(x, y);
    // Endothermic: absorb heat from neighbours during melting
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
      grid.addTemp(x + dx, y + dy, -10);
    }
  }
  // Ice is static — no movement
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/ice.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/ice.ts src/materials/ice.test.ts
git commit -m "feat: ice — melts to water when warm, absorbs heat from neighbours"
```

---

## Task 3: Snow

Snow is a cold powder that falls and slides like sand, melting to water when warm.

**Files:**
- Create: `src/materials/snow.ts`
- Create: `src/materials/snow.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/snow.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './snow';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SNOW)!(x, y, g);

describe('updateSnow', () => {
  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SNOW);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.SNOW);
  });

  it('melts to water when temp > 5 (probabilistic — 500 tries)', () => {
    let melted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SNOW);
      g.setTemp(2, 2, 50);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER || g.get(2, 3) === MaterialType.WATER) { melted = true; break; }
    }
    expect(melted).toBe(true);
  });

  it('does not melt when cold', () => {
    const g = new Grid(5, 5);
    // Block below so it doesn't fall
    g.set(2, 2, MaterialType.SNOW);
    g.set(2, 3, MaterialType.STONE);
    g.setTemp(2, 2, 2);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.SNOW);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/snow.test.ts 2>&1 | tail -10
```

Expected: FAIL (snow.ts not found).

- [ ] **Step 3: Implement snow.ts**

Create `src/materials/snow.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

registerHandler(MaterialType.SNOW, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp > 0) grid.setTemp(x, y, temp - 0.2);

  if (temp > 5 && Math.random() < 0.03) {
    grid.set(x, y, MaterialType.WATER);
    grid.setTemp(x, y, Math.max(0, temp - 30));
    grid.markUpdated(x, y);
    return;
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/snow.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/snow.ts src/materials/snow.test.ts
git commit -m "feat: snow — powder that melts to water when warm"
```

---

## Task 4: Lava

Lava is a hot dense liquid that radiates heat, cools to stone, and flash-vaporises adjacent water.

**Files:**
- Create: `src/materials/lava.ts`
- Create: `src/materials/lava.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/lava.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './lava';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.LAVA)!(x, y, g);

describe('updateLava', () => {
  it('cools to stone when temp < 300', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 200);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.STONE);
  });

  it('stays lava when temp >= 300', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1000);
    update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.LAVA);
  });

  it('radiates heat to neighbors when hot', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    g.set(2, 1, MaterialType.STONE);
    g.setTemp(2, 1, 20);
    update(2, 2, g);
    expect(g.getTemp(2, 1)).toBeGreaterThan(20);
  });

  it('vaporises adjacent water to steam', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    g.set(2, 1, MaterialType.WATER);
    update(2, 2, g);
    expect(g.get(2, 1)).toBe(MaterialType.STEAM);
  });

  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.LAVA);
    g.setTemp(2, 2, 1200);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.LAVA);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/lava.test.ts 2>&1 | tail -10
```

Expected: FAIL (lava.ts not found).

- [ ] **Step 3: Implement lava.ts**

Create `src/materials/lava.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';

const COOL_TEMP = 300;

registerHandler(MaterialType.LAVA, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  // Cool to stone
  if (temp < COOL_TEMP) {
    grid.set(x, y, MaterialType.STONE);
    grid.setTemp(x, y, temp);
    grid.markUpdated(x, y);
    return;
  }

  // Radiate heat to all 8 neighbours
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      grid.addTemp(x + dx, y + dy, 15 + Math.random() * 15);
    }
  }

  // Flash-vaporise adjacent water
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    if (grid.get(nx, ny) === MaterialType.WATER) {
      grid.set(nx, ny, MaterialType.STEAM);
      grid.setLifetime(nx, ny, 300 + Math.floor(Math.random() * 300));
      grid.setTemp(nx, ny, 100);
      grid.markUpdated(nx, ny);
      grid.addTemp(x, y, -200); // lava cools from contact
      break;
    }
  }

  // Passive cooling and slow flow
  grid.setTemp(x, y, Math.max(COOL_TEMP, temp - 0.5));
  if (!tryFall(x, y, grid)) {
    if (Math.random() < 0.3) tryFlow(x, y, grid, 2);
  }
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/lava.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/lava.ts src/materials/lava.test.ts
git commit -m "feat: lava — hot dense liquid that cools to stone, vaporises water"
```

---

## Task 5: Acid

Acid is a liquid that dissolves many materials and is neutralised by water.

**Files:**
- Create: `src/materials/acid.ts`
- Create: `src/materials/acid.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/acid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './acid';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.ACID)!(x, y, g);

describe('updateAcid', () => {
  it('dissolves adjacent sand (probabilistic — 500 tries)', () => {
    let dissolved = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ACID);
      g.set(2, 3, MaterialType.STONE); // block below so acid stays
      g.set(2, 1, MaterialType.SAND);
      update(2, 2, g);
      if (g.get(2, 1) === MaterialType.EMPTY) { dissolved = true; break; }
    }
    expect(dissolved).toBe(true);
  });

  it('is neutralised by adjacent water (probabilistic — 500 tries)', () => {
    let neutralised = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.ACID);
      g.set(2, 3, MaterialType.STONE);
      g.set(2, 1, MaterialType.WATER);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.WATER) { neutralised = true; break; }
    }
    expect(neutralised).toBe(true);
  });

  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ACID);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.ACID);
  });

  it('does not dissolve water source or fire source', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.ACID);
    g.set(2, 3, MaterialType.STONE);
    g.set(2, 1, MaterialType.WATER_SOURCE);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 1)).toBe(MaterialType.WATER_SOURCE);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/acid.test.ts 2>&1 | tail -10
```

Expected: FAIL (acid.ts not found).

- [ ] **Step 3: Implement acid.ts**

Create `src/materials/acid.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, tryFlow } from './movement';

const DISSOLVABLE = new Set<MaterialType>([
  MaterialType.SAND, MaterialType.STONE, MaterialType.WOOD,
  MaterialType.PLANT, MaterialType.ICE, MaterialType.SNOW,
  MaterialType.SALT, MaterialType.GUNPOWDER,
]);

registerHandler(MaterialType.ACID, (x, y, grid) => {
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (!grid.inBounds(nx, ny)) continue;
    const neighbor = grid.get(nx, ny);

    // Neutralised by water
    if (neighbor === MaterialType.WATER && Math.random() < 0.15) {
      grid.set(x, y, MaterialType.WATER);
      grid.markUpdated(x, y);
      return;
    }

    // Dissolve one neighbour per tick
    if (DISSOLVABLE.has(neighbor) && Math.random() < 0.02) {
      grid.set(nx, ny, MaterialType.EMPTY);
      grid.setTemp(nx, ny, 20);
      break;
    }
  }

  if (!tryFall(x, y, grid)) tryFlow(x, y, grid);
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/acid.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/acid.ts src/materials/acid.test.ts
git commit -m "feat: acid — dissolves sand/stone/wood/etc, neutralised by water"
```

---

## Task 6: Salt

Salt is a granular powder that falls like sand and dissolves when touching water.

**Files:**
- Create: `src/materials/salt.ts`
- Create: `src/materials/salt.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/salt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './salt';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.SALT)!(x, y, g);

describe('updateSalt', () => {
  it('falls into empty cell below', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SALT);
    update(2, 2, g);
    expect(g.get(2, 3)).toBe(MaterialType.SALT);
  });

  it('dissolves when adjacent to water (probabilistic — 500 tries)', () => {
    let dissolved = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SALT);
      g.set(2, 3, MaterialType.STONE); // block below
      g.set(2, 1, MaterialType.WATER);
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.EMPTY) { dissolved = true; break; }
    }
    expect(dissolved).toBe(true);
  });

  it('does not dissolve without water', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.SALT);
    g.set(2, 3, MaterialType.STONE);
    for (let i = 0; i < 200; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.SALT);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/salt.test.ts 2>&1 | tail -10
```

Expected: FAIL (salt.ts not found).

- [ ] **Step 3: Implement salt.ts**

Create `src/materials/salt.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

registerHandler(MaterialType.SALT, (x, y, grid) => {
  // Dissolve in adjacent water
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]] as [number, number][]) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.WATER && Math.random() < 0.15) {
      grid.set(x, y, MaterialType.EMPTY);
      grid.markUpdated(x, y);
      return;
    }
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/salt.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/salt.ts src/materials/salt.test.ts
git commit -m "feat: salt — powder that dissolves on contact with water"
```

---

## Task 7: Glass (formed from hot sand)

Glass is a static solid with no per-tick behavior. Sand transforms to glass when its temperature exceeds 800°C.

**Files:**
- Modify: `src/materials/sand.ts`
- Modify: `src/materials/sand.test.ts`

- [ ] **Step 1: Add a failing test to sand.test.ts**

Read the current `src/materials/sand.test.ts` first, then append this test inside the `describe` block:

```typescript
  it('transforms to glass when temp > 800 (probabilistic — 500 tries)', () => {
    let formed = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.SAND);
      g.setTemp(2, 2, 850);
      g.set(2, 3, MaterialType.STONE); // block below so sand stays
      update(2, 2, g);
      if (g.get(2, 2) === MaterialType.GLASS) { formed = true; break; }
    }
    expect(formed).toBe(true);
  });
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/sand.test.ts 2>&1 | tail -10
```

Expected: FAIL (`MaterialType.GLASS` not found or transform not implemented).

- [ ] **Step 3: Implement glass formation in sand.ts**

Replace `src/materials/sand.ts` with:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';
import { tryFall, trySlide } from './movement';

const GLASS_TEMP = 800;

registerHandler(MaterialType.SAND, (x, y, grid) => {
  const temp = grid.getTemp(x, y);

  if (temp >= GLASS_TEMP && Math.random() < 0.01) {
    grid.set(x, y, MaterialType.GLASS);
    grid.setTemp(x, y, temp - 100); // melting absorbs heat
    grid.markUpdated(x, y);
    return;
  }

  if (!tryFall(x, y, grid)) trySlide(x, y, grid);
});
```

Note: No glass.ts handler file is needed — glass is fully static (no per-tick behavior). The `getHandler` call in the simulation loop returns `undefined` for glass and skips it safely.

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/sand.test.ts
```

Expected: all sand tests pass (including the new glass test).

- [ ] **Step 5: Commit**

```bash
git add src/materials/sand.ts src/materials/sand.test.ts
git commit -m "feat: glass formation — sand transforms to glass above 800°C"
```

---

## Task 8: TNT

TNT is a solid that explodes when hot, clearing a radius, spawning fire, and generating a heat pulse that chain-ignites adjacent TNT.

**Files:**
- Create: `src/materials/tnt.ts`
- Create: `src/materials/tnt.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/tnt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './tnt';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.TNT)!(x, y, g);

describe('updateTNT', () => {
  it('does not explode when cold', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 20);
    update(7, 7, g);
    expect(g.get(7, 7)).toBe(MaterialType.TNT);
  });

  it('explodes when temp >= 150 — clears core and removes self', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    // Place sand nearby to check it gets cleared
    g.set(7, 8, MaterialType.SAND);
    update(7, 7, g);
    // TNT itself removed
    expect(g.get(7, 7)).toBe(MaterialType.EMPTY);
    // Adjacent sand cleared
    expect(g.get(7, 8)).toBe(MaterialType.EMPTY);
  });

  it('heats cells in blast radius', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    g.set(7, 4, MaterialType.STONE);
    g.setTemp(7, 4, 20);
    update(7, 7, g);
    expect(g.getTemp(7, 4)).toBeGreaterThan(20);
  });

  it('does not destroy water sources', () => {
    const g = new Grid(15, 15);
    g.set(7, 7, MaterialType.TNT);
    g.setTemp(7, 7, 200);
    g.set(7, 8, MaterialType.WATER_SOURCE);
    update(7, 7, g);
    expect(g.get(7, 8)).toBe(MaterialType.WATER_SOURCE);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/tnt.test.ts 2>&1 | tail -10
```

Expected: FAIL (tnt.ts not found).

- [ ] **Step 3: Implement tnt.ts**

Create `src/materials/tnt.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';

const IGNITION_TEMP = 150;
const BLAST_RADIUS  = 7;
const CLEAR_RADIUS  = 4;

// These materials survive explosions
const INDESTRUCTIBLE = new Set<MaterialType>([
  MaterialType.WATER_SOURCE,
  MaterialType.FIRE_SOURCE,
]);

registerHandler(MaterialType.TNT, (x, y, grid) => {
  if (grid.getTemp(x, y) < IGNITION_TEMP) return;

  // Explosion
  for (let edy = -BLAST_RADIUS; edy <= BLAST_RADIUS; edy++) {
    for (let edx = -BLAST_RADIUS; edx <= BLAST_RADIUS; edx++) {
      const dist = Math.sqrt(edx * edx + edy * edy);
      if (dist > BLAST_RADIUS) continue;
      const ex = x + edx; const ey = y + edy;
      if (!grid.inBounds(ex, ey)) continue;

      // Heat pulse — closer cells get more heat
      grid.addTemp(ex, ey, Math.round((BLAST_RADIUS - dist) * 120));

      const cell = grid.get(ex, ey);
      if (INDESTRUCTIBLE.has(cell)) continue;

      if (dist <= CLEAR_RADIUS) {
        // Blast core: clear everything
        grid.set(ex, ey, MaterialType.EMPTY);
        grid.setTemp(ex, ey, 20);
      } else if (grid.get(ex, ey) === MaterialType.EMPTY && Math.random() < 0.5) {
        // Blast ring: scatter fire
        grid.set(ex, ey, MaterialType.FIRE);
        grid.setLifetime(ex, ey, 20 + Math.floor(Math.random() * 30));
        grid.setTemp(ex, ey, 1200);
        grid.markUpdated(ex, ey);
      }
    }
  }

  // Remove self (already cleared by loop above if within CLEAR_RADIUS, but set explicitly)
  grid.set(x, y, MaterialType.EMPTY);
  grid.setTemp(x, y, 20);
  grid.markUpdated(x, y);
});
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --run src/materials/tnt.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/materials/tnt.ts src/materials/tnt.test.ts
git commit -m "feat: TNT — explodes on heat, clears radius, spawns fire ring, chains to adjacent TNT"
```

---

## Task 9: Water Source + Fire Source

These are static emitters that continuously produce water or fire into adjacent empty cells. They never move, burn, or explode.

**Files:**
- Create: `src/materials/water_source.ts`
- Create: `src/materials/fire_source.ts`
- Create: `src/materials/water_source.test.ts`
- Create: `src/materials/fire_source.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/materials/water_source.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './water_source';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.WATER_SOURCE)!(x, y, g);

describe('updateWaterSource', () => {
  it('emits water into an adjacent empty cell (probabilistic — 500 tries)', () => {
    let emitted = false;
    for (let i = 0; i < 500; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.WATER_SOURCE);
      update(2, 2, g);
      const neighbors: [number,number][] = [[2,3],[2,1],[1,2],[3,2]];
      if (neighbors.some(([nx,ny]) => g.get(nx,ny) === MaterialType.WATER)) { emitted = true; break; }
    }
    expect(emitted).toBe(true);
  });

  it('does not change its own cell type', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.WATER_SOURCE);
    for (let i = 0; i < 100; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.WATER_SOURCE);
  });
});
```

Create `src/materials/fire_source.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Grid } from '../simulation/grid';
import { MaterialType } from './types';
import './fire_source';
import { getHandler } from './registry';

const update = (x: number, y: number, g: Grid) => getHandler(MaterialType.FIRE_SOURCE)!(x, y, g);

describe('updateFireSource', () => {
  it('emits fire into an adjacent empty cell (probabilistic — 200 tries)', () => {
    let emitted = false;
    for (let i = 0; i < 200; i++) {
      const g = new Grid(5, 5);
      g.set(2, 2, MaterialType.FIRE_SOURCE);
      update(2, 2, g);
      const neighbors: [number,number][] = [[2,1],[2,3],[1,2],[3,2]];
      if (neighbors.some(([nx,ny]) => g.get(nx,ny) === MaterialType.FIRE)) { emitted = true; break; }
    }
    expect(emitted).toBe(true);
  });

  it('does not change its own cell type', () => {
    const g = new Grid(5, 5);
    g.set(2, 2, MaterialType.FIRE_SOURCE);
    for (let i = 0; i < 100; i++) update(2, 2, g);
    expect(g.get(2, 2)).toBe(MaterialType.FIRE_SOURCE);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- --run src/materials/water_source.test.ts src/materials/fire_source.test.ts 2>&1 | tail -10
```

Expected: FAIL (handler files not found).

- [ ] **Step 3: Implement water_source.ts**

Create `src/materials/water_source.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.WATER_SOURCE, (x, y, grid) => {
  if (Math.random() >= 0.3) return;

  // Try to emit below first, then sides, then above
  const dirs: [number, number][] = [
    [0, grid.gravityDir], [-1, 0], [1, 0], [0, -grid.gravityDir],
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.EMPTY) {
      grid.set(nx, ny, MaterialType.WATER);
      grid.setTemp(nx, ny, 20);
      grid.markUpdated(nx, ny);
      return;
    }
  }
});
```

- [ ] **Step 4: Implement fire_source.ts**

Create `src/materials/fire_source.ts`:

```typescript
import { MaterialType } from './types';
import { registerHandler } from './registry';

registerHandler(MaterialType.FIRE_SOURCE, (x, y, grid) => {
  if (Math.random() >= 0.5) return;

  // Try to emit above first (fire rises), then sides, then below
  const dirs: [number, number][] = [
    [0, -grid.gravityDir], [-1, 0], [1, 0], [0, grid.gravityDir],
  ];
  for (const [dx, dy] of dirs) {
    const nx = x + dx; const ny = y + dy;
    if (grid.inBounds(nx, ny) && grid.get(nx, ny) === MaterialType.EMPTY) {
      grid.set(nx, ny, MaterialType.FIRE);
      grid.setLifetime(nx, ny, 80 + Math.floor(Math.random() * 40));
      grid.setTemp(nx, ny, 900);
      grid.markUpdated(nx, ny);
      return;
    }
  }
});
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test -- --run src/materials/water_source.test.ts src/materials/fire_source.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/materials/water_source.ts src/materials/fire_source.ts \
        src/materials/water_source.test.ts src/materials/fire_source.test.ts
git commit -m "feat: water source and fire source — static emitters that continuously produce water/fire"
```

---

## Task 10: Wire Everything Up

Connect all new materials to the index, sidebar, controls, and renderer. Verify the full suite still passes.

**Files:**
- Modify: `src/materials/index.ts`
- Modify: `src/ui/sidebar.ts`
- Modify: `src/ui/controls.ts`
- Modify: `src/simulation/renderer.ts`

- [ ] **Step 1: Update index.ts**

Replace `src/materials/index.ts` with:

```typescript
import './stone';
import './sand';
import './water';
import './oil';
import './fire';
import './smoke';
import './steam';
import './wood';
import './gunpowder';
import './plant';
import './ice';
import './lava';
import './acid';
import './salt';
import './snow';
import './tnt';
import './water_source';
import './fire_source';
import './reactions-init';
```

- [ ] **Step 2: Update sidebar.ts GROUPS**

Replace the `GROUPS` constant at the top of `src/ui/sidebar.ts` with:

```typescript
const GROUPS: { label: string; types: MaterialType[] }[] = [
  { label: 'POWDERS', types: [MaterialType.SAND, MaterialType.GUNPOWDER, MaterialType.SALT, MaterialType.SNOW] },
  { label: 'LIQUIDS', types: [MaterialType.WATER, MaterialType.OIL, MaterialType.LAVA, MaterialType.ACID] },
  { label: 'SOLIDS',  types: [MaterialType.STONE, MaterialType.WOOD, MaterialType.ICE, MaterialType.GLASS, MaterialType.TNT] },
  { label: 'GASES',   types: [MaterialType.FIRE, MaterialType.SMOKE, MaterialType.STEAM] },
  { label: 'LIFE',    types: [MaterialType.PLANT] },
  { label: 'SOURCES', types: [MaterialType.WATER_SOURCE, MaterialType.FIRE_SOURCE] },
];
```

- [ ] **Step 3: Update controls.ts — PALETTE and paint()**

In `src/ui/controls.ts`, replace the `PALETTE` array inside `bindKeyboard()`:

```typescript
const PALETTE = [
  MaterialType.SAND, MaterialType.WATER, MaterialType.FIRE,
  MaterialType.SMOKE, MaterialType.GUNPOWDER, MaterialType.PLANT,
  MaterialType.WOOD, MaterialType.OIL, MaterialType.STEAM, MaterialType.STONE,
  MaterialType.ICE, MaterialType.LAVA, MaterialType.ACID, MaterialType.SALT,
  MaterialType.SNOW, MaterialType.GLASS, MaterialType.TNT,
  MaterialType.WATER_SOURCE, MaterialType.FIRE_SOURCE,
];
```

In the same file, add a lava hot-start to the `paint()` method. The current block is:

```typescript
if (type === MaterialType.FIRE)  { this.grid.setLifetime(nx, ny, 80 + Math.floor(Math.random() * 40)); this.grid.setTemp(nx, ny, 900); }
if (type === MaterialType.SMOKE) { this.grid.setLifetime(nx, ny, 100 + Math.floor(Math.random() * 60)); }
if (type === MaterialType.STEAM) { this.grid.setLifetime(nx, ny, 600 + Math.floor(Math.random() * 600)); }
```

Replace it with:

```typescript
if (type === MaterialType.FIRE)  { this.grid.setLifetime(nx, ny, 80 + Math.floor(Math.random() * 40)); this.grid.setTemp(nx, ny, 900); }
if (type === MaterialType.SMOKE) { this.grid.setLifetime(nx, ny, 100 + Math.floor(Math.random() * 60)); }
if (type === MaterialType.STEAM) { this.grid.setLifetime(nx, ny, 600 + Math.floor(Math.random() * 600)); }
if (type === MaterialType.LAVA)  { this.grid.setTemp(nx, ny, 1200); }
```

- [ ] **Step 4: Update renderer.ts — add Lava, Ice, Snow animation cases**

In `src/simulation/renderer.ts`, add these cases to the `switch (type)` block inside `cellColor()`, before the `default:`:

```typescript
      case MaterialType.LAVA: {
        const flicker = Math.floor(Math.random() * 30);
        return [Math.min(255, 220 + flicker), Math.max(0, 60 - flicker), 0];
      }
      case MaterialType.ICE: {
        const s = Math.floor(Math.random() * 8);
        return [173 + s, 216 + s, Math.min(255, 230 + s)];
      }
      case MaterialType.SNOW: {
        const s = Math.floor(Math.random() * 15);
        return [Math.min(255, 230 + s), Math.min(255, 240 + s), 255];
      }
```

- [ ] **Step 5: Run the full test suite**

```bash
npm test -- --run
```

Expected: all tests pass (existing 86 + new ~20 = ~106 total).

- [ ] **Step 6: Commit**

```bash
git add src/materials/index.ts src/ui/sidebar.ts src/ui/controls.ts src/simulation/renderer.ts
git commit -m "feat: wire up all 9 new materials — sidebar, controls, renderer, imports"
```

---

## Self-Review

**Spec coverage:**
- ✅ Ice — melts to water, endothermic, static solid
- ✅ Lava — hot liquid, cools to stone, vaporises water, radiates heat
- ✅ Acid — dissolves sand/stone/wood/plant/ice/snow/salt/gunpowder, neutralised by water
- ✅ Salt — granular powder, dissolves in water
- ✅ Snow — granular powder, melts to water when warm
- ✅ Glass — static solid, formed from sand > 800°C (sand.ts transform)
- ✅ TNT — static solid, explodes when hot, clears radius, spawns fire ring, heat pulse
- ✅ Water Source — static emitter, produces water below at 30%/tick
- ✅ Fire Source — static emitter, produces fire above at 50%/tick
- ✅ Sidebar wired up with SOURCES group
- ✅ Controls palette updated, Lava starts at 1200°C when painted
- ✅ Renderer flicker for Lava, Ice, Snow

**Type consistency check:**
- `tryFlow(x, y, grid, 2)` — `tryFlow` signature is `(x, y, grid, maxDist = 4)` ✅
- `tryFall`, `trySlide` — used in snow.ts and salt.ts ✅
- `grid.setLifetime` max 65535 (Uint16Array) — steam/lava steam use 300–600 ✅
- `MATERIAL_META[MaterialType.GLASS]` — defined in Task 1 ✅
- `MaterialType.WATER_SOURCE` used in tnt.ts INDESTRUCTIBLE — defined in Task 1 ✅
