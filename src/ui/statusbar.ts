import { MaterialType, MATERIAL_META } from '../materials/types';

export class StatusBar {
  private spans: [HTMLElement, HTMLElement, HTMLElement, HTMLElement];

  constructor(private el: HTMLElement) {
    // Create spans once; update textContent each tick instead of rebuilding the DOM
    this.spans = [0, 1, 2, 3].map(() => {
      const s = document.createElement('span');
      el.appendChild(s);
      return s;
    }) as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
  }

  update(fps: number, activeCells: number, material: MaterialType, brushSize: number): void {
    const name = material === MaterialType.EMPTY
      ? 'ERASER'
      : MATERIAL_META[material].name.toUpperCase();
    this.spans[0].textContent = `FPS: ${fps}`;
    this.spans[1].textContent = `CELLS: ${activeCells.toLocaleString()}`;
    this.spans[2].textContent = `MATERIAL: ${name}`;
    this.spans[3].textContent = `BRUSH: ${brushSize}`;
  }
}
