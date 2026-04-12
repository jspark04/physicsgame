import { MaterialType } from '../materials/types';
export class Sidebar {
  onMaterialSelect?: (t: MaterialType) => void;
  onPauseToggle?: () => void;
  onClear?: () => void;
  onGravityFlip?: () => void;
  onSave?: () => void;
  onLoad?: (f: File) => void;
  onBrushChange?: (s: number) => void;
  onSpeedChange?: (m: number) => void;
  constructor(_el: HTMLElement) {}
  selectMaterial(_t: MaterialType) {}
}
