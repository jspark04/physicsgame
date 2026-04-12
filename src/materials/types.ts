export enum MaterialType {
  EMPTY     = 0,
  SAND      = 1,
  WATER     = 2,
  FIRE      = 3,
  SMOKE     = 4,
  GUNPOWDER = 5,
  PLANT     = 6,
  WOOD      = 7,
  OIL       = 8,
  STEAM     = 9,
  STONE     = 10,
}

export interface MaterialMeta {
  readonly name: string;
  readonly density: number;
  readonly baseColor: readonly [number, number, number];
  readonly flammable: boolean;
  readonly ignitionTemp: number;
}

export const MATERIAL_META: Readonly<Record<MaterialType, MaterialMeta>> = {
  [MaterialType.EMPTY]:     { name: 'Empty',     density: 0,    baseColor: [5,   5,   8],   flammable: false, ignitionTemp: Infinity },
  [MaterialType.SAND]:      { name: 'Sand',      density: 1.5,  baseColor: [194, 160, 110], flammable: false, ignitionTemp: Infinity },
  [MaterialType.WATER]:     { name: 'Water',     density: 1.0,  baseColor: [58,  143, 199], flammable: false, ignitionTemp: Infinity },
  [MaterialType.FIRE]:      { name: 'Fire',      density: 0.01, baseColor: [255, 106, 0],   flammable: false, ignitionTemp: Infinity },
  [MaterialType.SMOKE]:     { name: 'Smoke',     density: 0.01, baseColor: [100, 100, 100], flammable: false, ignitionTemp: Infinity },
  [MaterialType.GUNPOWDER]: { name: 'Gunpowder', density: 1.4,  baseColor: [60,  60,  60],  flammable: true,  ignitionTemp: 200 },
  [MaterialType.PLANT]:     { name: 'Plant',     density: 1.8,  baseColor: [58,  125, 68],  flammable: true,  ignitionTemp: 100 },
  [MaterialType.WOOD]:      { name: 'Wood',      density: 2.0,  baseColor: [139, 94,  60],  flammable: true,  ignitionTemp: 250 },
  [MaterialType.OIL]:       { name: 'Oil',       density: 0.8,  baseColor: [200, 180, 50],  flammable: true,  ignitionTemp: 150 },
  [MaterialType.STEAM]:     { name: 'Steam',     density: 0.02, baseColor: [176, 196, 222], flammable: false, ignitionTemp: Infinity },
  [MaterialType.STONE]:     { name: 'Stone',     density: 3.0,  baseColor: [120, 120, 120], flammable: false, ignitionTemp: Infinity },
};

export function getDensity(type: MaterialType): number {
  return MATERIAL_META[type].density;
}
