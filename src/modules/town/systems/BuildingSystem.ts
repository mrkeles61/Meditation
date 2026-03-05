import type { Container } from 'pixi.js';
import type { SceneRenderer, SceneBuilding } from '../rendering/SceneRenderer';
import { useTownStore } from '../stores/townStore';

export class BuildingSystem {
    private scene: SceneRenderer;
    private selectedContainer: Container | null = null;

    constructor(scene: SceneRenderer) {
        this.scene = scene;
    }

    bindEvents(): void {
        const buildings = this.scene.getBuildingContainers();

        for (const [habitType, sb] of buildings) {
            sb.container.on('pointertap', (e) => {
                e.stopPropagation();
                this.handleTap(habitType, sb);
            });
        }
    }

    private handleTap(habitType: string, sb: SceneBuilding): void {
        const buildings = this.scene.getBuildingContainers();

        // Dim all others
        for (const [ht, other] of buildings) {
            if (ht === habitType) {
                other.container.alpha = 1;
            } else {
                other.container.alpha = 0.7;
            }
        }

        // Bounce animation
        this.bounceBuilding(sb.container);
        this.selectedContainer = sb.container;

        // Dispatch to store
        useTownStore.getState().selectBuilding(habitType);

        // Haptic (Capacitor)
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }

    deselect(): void {
        const buildings = this.scene.getBuildingContainers();
        for (const [, sb] of buildings) {
            sb.container.alpha = 1;
        }
        this.selectedContainer = null;
        useTownStore.getState().selectBuilding(null);
    }

    private bounceBuilding(container: Container): void {
        const originalScaleX = container.scale.x;
        const originalScaleY = container.scale.y;
        let frame = 0;
        const totalFrames = 18;

        const bounce = () => {
            frame++;
            const t = frame / totalFrames;
            const ease = Math.sin(t * Math.PI) * (1 - t);
            container.scale.set(
                originalScaleX * (1 + ease * 0.05),
                originalScaleY * (1 + ease * 0.08),
            );

            if (frame < totalFrames) {
                requestAnimationFrame(bounce);
            } else {
                container.scale.set(originalScaleX, originalScaleY);
            }
        };
        requestAnimationFrame(bounce);
    }
}
