import type { Container } from 'pixi.js';

export class CameraSystem {
    private container: Container;
    private currentZoom = 1;
    private targetZoom = 1;
    private minZoom: number;
    private maxZoom: number;

    constructor(container: Container, minZoom = 0.8, maxZoom = 1.5) {
        this.container = container;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
    }

    bindEvents(canvas: HTMLCanvasElement): void {
        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + delta));
        }, { passive: false });

        // Pinch zoom
        let lastDist = 0;
        canvas.addEventListener('touchstart', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                lastDist = getTouchDist(e);
            }
        });
        canvas.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dist = getTouchDist(e);
                const scale = dist / lastDist;
                this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * scale));
                lastDist = dist;
            }
        });
    }

    update(): void {
        // Smooth lerp toward target
        this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
        this.container.scale.set(this.currentZoom);
    }

    destroy(): void {
        // Events are cleaned up when canvas is destroyed
    }
}

function getTouchDist(e: TouchEvent): number {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
