import { MaterialType, MATERIAL_META } from '../materials/types';

export class StatusBar {
  constructor(private el: HTMLElement) {}

  update(fps: number, activeCells: number, material: MaterialType, brushSize: number): void {
    const name = material === MaterialType.EMPTY
      ? 'ERASER'
      : MATERIAL_META[material].name.toUpperCase();

    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);

    for (const text of [
      `FPS: ${fps}`,
      `CELLS: ${activeCells.toLocaleString()}`,
      `MATERIAL: ${name}`,
      `BRUSH: ${brushSize}`,
    ]) {
      const span = document.createElement('span');
      span.textContent = text;
      this.el.appendChild(span);
    }
  }
}
