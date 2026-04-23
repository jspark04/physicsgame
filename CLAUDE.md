# physicsgame — Claude Code Context

## Dev server
- `npm run dev` — Vite on port 5173
- `.claude/launch.json` must exist for the preview tool (`preview_start`) to work; create it pointing at `npm run dev` on port 5173
- `window.confirm = () => true` required before triggering the Clear button in browser automation

## Architecture
- Each material is a single file in `src/materials/` that calls `registerHandler(MaterialType.X, ...)`
- `src/materials/index.ts` must import every new material file — easy to forget
- Temperature is stored per-cell in `Grid.temps: Float32Array` (init 20°C); lifetime in `Grid.lifetimes: Uint16Array`
- The simulation tick sweeps bottom-up, shuffled columns to avoid directional bias

## Thermodynamics model
- **Lava** uses bidirectional conduction (`diff * 0.003`, cap 5) — skips LAVA and EMPTY neighbours; passive cooling -0.3°C/tick; solidifies at `<= 300°C`
- **Stone** conductivity `0.006` — hot stone (freshly solidified lava ~299°C) boils adjacent water in ~1s
- **Water** self-cooling `0.1°C/tick` (not 0.5) — lower value lets heat from hot stone accumulate
- **Snow/Ice** melt probability scales with temperature: `Math.min(0.95, (temp-5)/100 * 0.5)` for snow, `/150` for ice
- Common bug pattern: `Math.max(COOL_TEMP, temp - n)` clamps temperature and silently prevents phase transitions — always check cooling floors vs threshold conditions

## Testing
- `npm test` — vitest, 113 tests across `src/**/*.test.ts`
- Snow/ice fall tests must set `g.setTemp(2, 2, 2)` (or 0) explicitly — default grid temp 20°C triggers the melt path
- Probabilistic tests use 200–500 retry loops, not fixed seeds

## Git
- Main working branch: `main`; feature work goes in worktrees via `superpowers:using-git-worktrees`
- `feature/falling-sand-game` and `origin/feature/new-materials` are legacy branches — check before basing new work on them
