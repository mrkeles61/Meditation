import * as THREE from 'three';

/**
 * Fixed-angle overhead camera (Egg Inc / Crossy Road style).
 * The view angle is locked — users can only drag-to-pan and pinch-to-zoom.
 *
 * Implementation: we track a `target` position in XZ, and keep the camera
 * at `target + offset`.  Zoom changes the magnitude of the offset.
 */
export class ThreeCameraSystem {
    private camera: THREE.PerspectiveCamera;

    // Base offset from target (defines the fixed view angle)
    private readonly BASE_OFFSET = new THREE.Vector3(0, 22, 18);

    // Current and target states for smooth lerp
    private targetPos = new THREE.Vector3(0, 0, 1.5);
    private smoothTarget = new THREE.Vector3(0, 0, 1.5);
    private zoomLevel = 1.0;
    private smoothZoom = 1.0;

    // Zoom limits
    private readonly MIN_ZOOM = 0.55;
    private readonly MAX_ZOOM = 1.8;

    // Pan limits in world units
    private readonly MAX_PAN_XZ = 5.0;

    // Drag state
    private isDragging = false;
    private dragStart = new THREE.Vector2();
    private dragStartTarget = new THREE.Vector3();
    private activePointerId = -1;

    // Pinch state
    private lastPinchDist = 0;

    // Tap discrimination (don't fire tap if moved > threshold pixels)
    private totalDragPx = 0;
    private readonly TAP_THRESHOLD = 8;

    // Screen dimensions for NDC conversion
    private screenW = 1;
    private screenH = 1;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.syncCamera();
    }

    bindEvents(canvas: HTMLCanvasElement, w: number, h: number): void {
        this.screenW = w;
        this.screenH = h;

        // ── Desktop: scroll-wheel zoom ──
        canvas.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.1 : -0.1;
            this.zoomLevel = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoomLevel + delta));
        }, { passive: false });

        // ── Desktop: pointer drag ──
        canvas.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            this.isDragging = true;
            this.activePointerId = e.pointerId;
            this.dragStart.set(e.clientX, e.clientY);
            this.dragStartTarget.copy(this.targetPos);
            this.totalDragPx = 0;
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove', (e: PointerEvent) => {
            if (!this.isDragging || e.pointerId !== this.activePointerId) return;
            if (e.pointerType === 'touch') return;

            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            this.totalDragPx += Math.abs(e.movementX) + Math.abs(e.movementY);
            this.applyPan(dx, dy);
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

        // ── Mobile: touch (pan + pinch) ──
        canvas.addEventListener('touchstart', (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                this.lastPinchDist = getTouchDist(e);
            } else if (e.touches.length === 1) {
                this.dragStart.set(e.touches[0].clientX, e.touches[0].clientY);
                this.dragStartTarget.copy(this.targetPos);
                this.totalDragPx = 0;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                const dist = getTouchDist(e);
                if (this.lastPinchDist > 0) {
                    const scale = dist / this.lastPinchDist;
                    this.zoomLevel = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoomLevel / scale));
                }
                this.lastPinchDist = dist;
            } else if (e.touches.length === 1) {
                const dx = e.touches[0].clientX - this.dragStart.x;
                const dy = e.touches[0].clientY - this.dragStart.y;
                this.totalDragPx = Math.sqrt(dx * dx + dy * dy);
                this.applyPan(dx, dy);
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            this.lastPinchDist = 0;
        });
    }

    /** Returns true if the last interaction was a tap (not a drag). */
    get wasTap(): boolean {
        return this.totalDragPx < this.TAP_THRESHOLD;
    }

    /** Convert pixel deltas from a drag into XZ world movement. */
    private applyPan(dx: number, dy: number): void {
        // Scale drag by zoom so panning feels consistent at all zoom levels
        const panScale = 0.025 / this.zoomLevel;
        const newX = this.dragStartTarget.x - dx * panScale;
        const newZ = this.dragStartTarget.z - dy * panScale;

        this.targetPos.set(
            Math.max(-this.MAX_PAN_XZ, Math.min(this.MAX_PAN_XZ, newX)),
            0,
            Math.max(-this.MAX_PAN_XZ, Math.min(this.MAX_PAN_XZ, newZ)),
        );
    }

    update(): void {
        // Smooth lerp toward targets
        this.smoothTarget.lerp(this.targetPos, 0.12);
        this.smoothZoom += (this.zoomLevel - this.smoothZoom) * 0.1;
        this.syncCamera();
    }

    private syncCamera(): void {
        const offset = this.BASE_OFFSET.clone().multiplyScalar(1 / this.smoothZoom);
        this.camera.position.copy(this.smoothTarget).add(offset);
        this.camera.lookAt(this.smoothTarget);
    }

    resize(w: number, h: number): void {
        this.screenW = w;
        this.screenH = h;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    destroy(): void { /* events live with canvas */ }
}

function getTouchDist(e: TouchEvent): number {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
