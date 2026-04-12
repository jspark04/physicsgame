import { MaterialType } from './types';
import type { Grid } from '../simulation/grid';

export type MaterialHandler = (x: number, y: number, grid: Grid) => void;

const handlers = new Map<MaterialType, MaterialHandler>();

export function registerHandler(type: MaterialType, handler: MaterialHandler): void {
  handlers.set(type, handler);
}

export function getHandler(type: MaterialType): MaterialHandler | undefined {
  return handlers.get(type);
}

/** Reset handler map — for test isolation only. */
export function _resetForTests(): void { handlers.clear(); }
