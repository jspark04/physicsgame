import { MaterialType, MATERIAL_META } from '../materials/types';

const GROUPS: { label: string; types: MaterialType[] }[] = [
  { label: 'POWDERS', types: [MaterialType.SAND, MaterialType.GUNPOWDER] },
  { label: 'LIQUIDS', types: [MaterialType.WATER, MaterialType.OIL] },
  { label: 'SOLIDS',  types: [MaterialType.STONE, MaterialType.WOOD] },
  { label: 'GASES',   types: [MaterialType.FIRE, MaterialType.SMOKE, MaterialType.STEAM] },
  { label: 'LIFE',    types: [MaterialType.PLANT] },
];

export class Sidebar {
  onMaterialSelect?: (t: MaterialType) => void;
  onPauseToggle?: () => void;
  onClear?: () => void;
  onGravityFlip?: () => void;
  onSave?: () => void;
  onLoad?: (f: File) => void;
  onBrushChange?: (s: number) => void;
  onSpeedChange?: (m: number) => void;

  private buttons = new Map<MaterialType, HTMLButtonElement>();
  private active: MaterialType = MaterialType.SAND;
  private fileInput: HTMLInputElement;

  constructor(container: HTMLElement) {
    while (container.firstChild) container.removeChild(container.firstChild);
    this.fileInput = this.createFileInput();
    this.buildPalette(container);
    this.buildActions(container);
    this.buildSliders(container);
    this.selectMaterial(MaterialType.SAND);
  }

  selectMaterial(type: MaterialType): void {
    const prev = this.buttons.get(this.active);
    if (prev) prev.style.borderColor = '#2a2a2a';
    this.active = type;
    const next = this.buttons.get(type);
    if (next) next.style.borderColor = '#888';
    this.onMaterialSelect?.(type);
  }

  private createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sand';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) { this.onLoad?.(file); input.value = ''; }
    });
    document.body.appendChild(input);
    return input;
  }

  private buildPalette(container: HTMLElement): void {
    for (const group of GROUPS) {
      const label = document.createElement('div');
      label.textContent = group.label;
      label.style.cssText = 'font-size:9px;color:#444;letter-spacing:1px;margin-top:6px;';
      container.appendChild(label);

      for (const type of group.types) {
        const meta = MATERIAL_META[type];
        const btn = document.createElement('button');
        btn.textContent = meta.name.toUpperCase();
        const [r, g, b] = meta.baseColor;
        btn.style.cssText = `display:block;width:100%;padding:4px 6px;background:#1a1a1a;border:1px solid #2a2a2a;color:rgb(${r},${g},${b});font-family:monospace;font-size:11px;cursor:pointer;text-align:left;border-radius:2px;`;
        btn.addEventListener('click', () => this.selectMaterial(type));
        this.buttons.set(type, btn);
        container.appendChild(btn);
      }
    }

    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:#222;margin:6px 0;';
    container.appendChild(sep);

    const eraser = document.createElement('button');
    eraser.textContent = 'ERASER';
    eraser.style.cssText = 'display:block;width:100%;padding:4px 6px;background:#1a1a1a;border:1px solid #2a2a2a;color:#555;font-family:monospace;font-size:11px;cursor:pointer;text-align:left;border-radius:2px;';
    eraser.addEventListener('click', () => this.selectMaterial(MaterialType.EMPTY));
    this.buttons.set(MaterialType.EMPTY, eraser);
    container.appendChild(eraser);
  }

  private buildActions(container: HTMLElement): void {
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:#222;margin:6px 0;';
    container.appendChild(sep);

    const actions: [string, () => void][] = [
      ['Pause',   () => this.onPauseToggle?.()],
      ['Clear',   () => this.onClear?.()],
      ['Gravity', () => this.onGravityFlip?.()],
      ['Save',    () => this.onSave?.()],
      ['Load',    () => this.fileInput.click()],
    ];

    for (const [label, handler] of actions) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.cssText = 'display:block;width:100%;padding:3px 6px;background:#0d0d0d;border:1px solid #222;color:#555;font-family:monospace;font-size:10px;cursor:pointer;text-align:left;border-radius:2px;margin-bottom:2px;';
      btn.addEventListener('click', handler);
      container.appendChild(btn);
    }
  }

  private buildSliders(container: HTMLElement): void {
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:#222;margin:6px 0;';
    container.appendChild(sep);

    this.addSlider(container, 'Brush', 1, 20, 3, (v) => this.onBrushChange?.(v));

    // Speed: map slider 1-5 to [0.25, 0.5, 1, 2, 4]
    const speeds = [0.25, 0.5, 1, 2, 4];
    this.addSlider(container, 'Speed', 1, 5, 3, (v) => this.onSpeedChange?.(speeds[v - 1] ?? 1));
  }

  private addSlider(container: HTMLElement, label: string, min: number, max: number, value: number, onChange: (v: number) => void): void {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:4px;';
    const lbl = document.createElement('div');
    lbl.textContent = label;
    lbl.style.cssText = 'font-size:9px;color:#444;margin-bottom:2px;';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(min);
    slider.max = String(max);
    slider.value = String(value);
    slider.style.cssText = 'width:100%;accent-color:#555;';
    slider.addEventListener('input', () => onChange(Number(slider.value)));
    wrap.appendChild(lbl);
    wrap.appendChild(slider);
    container.appendChild(wrap);
  }
}
