import type { Container } from 'pixi.js';

export class CameraSystem {
    private container: Container;

    // Zoom state
    private currentZoom = 1;
    private targetZoom = 1;
    private minZoom: number;
    private maxZoom: number;

    // Pan state
    private panX = 0;
    private panY = 0;
    private targetPanX = 0;
    private targetPanY = 0;

    // Drag tracking
    private isDragging = false;
    private lastPX = 0;
    private lastPY = 0;
    private activePointerId = -1;

    // Pinch tracking
    private lastPinchDist = 0;
    private lastPinchMidX = 0;
    private lastPinchMidY = 0;

    // Bounds
    private screenW = 0;
    private screenH = 0;

    constructor(container: Container, minZoom = 0.8, maxZoom = 2.0) {
        this.container = container;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
    }

    bindEvents(canvas: HTMLCanvasElement, screenW: number, screenH: number): void {
        this.screenW = screenW;
        this.screenH = screenH;

        // ── Desktop: scroll-wheel zoom ──
        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.08 : 0.08;
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + delta));
            this.clampPan();
        }, { passive: false });

        // ── Desktop: pointer drag-to-pan ──
        canvas.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return; // handled by touch events below
            this.isDragging = true;
            this.activePointerId = e.pointerId;
            this.lastPX = e.clientX;
            this.lastPY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove', (e: PointerEvent) => {
            if (!this.isDragging || e.pointerId !== this.activePointerId) return;
            if (e.pointerType === 'touch') return;
            const dx = e.clientX - this.lastPX;
            const dy = e.clientY - this.lastPY;
            this.lastPX = e.clientX;
            this.lastPY = e.clientY;
            this.targetPanX += dx;
            this.targetPanY += dy;
            this.clampPan();
        });

        canvas.addEventListener('pointerup', (e: PointerEvent) => {
            if (e.pointerId === this.activePointerId) {
                this.isDragging = false;
                this.activePointerId = -1;
            }
        });

        canvas.addEventListener('pointercancel', () => {
            this.isDragging = false;
            this.activePointerId = -1;
        });

        // ── Mobile: touch events (pan + pinch-zoom combined) ──
        canvas.addEventListener('touchstart', (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                this.lastPinchDist = getTouchDist(e);
                const mid = getTouchMid(e);
                this.lastPinchMidX = mid.x;
                this.lastPinchMidY = mid.y;
            } else if (e.touches.length === 1) {
                this.lastPX = e.touches[0].clientX;
                this.lastPY = e.touches[0].clientY;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                // Pinch-to-zoom
                const dist = getTouchDist(e);
                if (this.lastPinchDist > 0) {
                    const scale = dist / this.lastPinchDist;
                    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * scale));
                }
                this.lastPinchDist = dist;

                // Two-finger pan (midpoint delta)
                const mid = getTouchMid(e);
                this.targetPanX += mid.x - this.lastPinchMidX;
                this.targetPanY += mid.y - this.lastPinchMidY;
                this.lastPinchMidX = mid.x;
                this.lastPinchMidY = mid.y;
                this.clampPan();
            } else if (e.touches.length === 1) {
                // Single-finger pan
                const dx = e.touches[0].clientX - this.lastPX;
                const dy = e.touches[0].clientY - this.lastPY;
                this.lastPX = e.touches[0].clientX;
                this.lastPY = e.touches[0].clientY;
                this.targetPanX += dx;
                this.targetPanY += dy;
                this.clampPan();
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            this.lastPinchDist = 0;
        });
    }

    private clampPan(): void {
        // Pan room grows with zoom level
        const maxPanX = Math.max(0, this.screenW * (this.currentZoom - 1) * 0.6);
        const maxPanY = Math.max(0, this.screenH * (this.currentZoom - 1) * 0.6);
        this.targetPanX = Math.max(-maxPanX, Math.min(maxPanX, this.targetPanX));
        this.targetPanY = Math.max(-maxPanY, Math.min(maxPanY, this.targetPanY));
    }

    update(): void {
        // Smooth lerp toward targets
        this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
        this.panX += (this.targetPanX - this.panX) * 0.12;
        this.panY += (this.targetPanY - this.panY) * 0.12;

        this.container.scale.set(this.currentZoom);
        this.container.position.set(this.panX, this.panY);
    }

    resize(screenW: number, screenH: number): void {
        this.screenW = screenW;
        this.screenH = screenH;
        this.clampPan();
    }

    destroy(): void {
        // Events cleaned up when canvas is destroyed
    }
}

function getTouchDist(e: TouchEvent): number {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMid(e: TouchEvent): { x: number; y: number } {
    return {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    };
}
