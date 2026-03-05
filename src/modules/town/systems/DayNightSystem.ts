import { ColorMatrixFilter, Container } from 'pixi.js';

export class DayNightSystem {
    private container: Container;
    private filter: ColorMatrixFilter;

    constructor(container: Container) {
        this.container = container;
        this.filter = new ColorMatrixFilter();
        this.container.filters = [this.filter];
    }

    update(): void {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const t = hour + minute / 60;

        if (t >= 6 && t < 18) {
            // Daytime — full brightness
            this.filter.reset();
        } else if (t >= 18 && t < 20) {
            // Sunset — warm amber tint
            const progress = (t - 18) / 2;
            this.filter.reset();
            this.filter.saturate(0.15 * progress, true);
            const m = this.filter.matrix;
            m[0] = 1 + 0.15 * progress;  // red
            m[6] = 1 + 0.05 * progress;  // green
            m[12] = 1 - 0.15 * progress; // blue
        } else if (t >= 20 || t < 5) {
            // Night — cool blue tint
            this.filter.reset();
            this.filter.saturate(-0.2, true);
            const m = this.filter.matrix;
            m[0] = 0.8;   // red down
            m[6] = 0.85;  // green slightly down
            m[12] = 1.15; // blue up
            this.filter.brightness(0.7, true);
        } else {
            // Dawn (5-6am) — pink/gold
            const progress = (t - 5);
            this.filter.reset();
            const m = this.filter.matrix;
            m[0] = 0.85 + 0.15 * progress;
            m[6] = 0.85 + 0.15 * progress;
            m[12] = 1.1 - 0.1 * progress;
            this.filter.brightness(0.75 + 0.25 * progress, true);
        }
    }

    destroy(): void {
        this.container.filters = [];
    }
}
