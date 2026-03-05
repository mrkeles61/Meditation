import { Container, Graphics, type Ticker } from 'pixi.js';

const MAX_PARTICLES = 30;

interface Particle {
    gfx: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    phase: number;
}

export class AmbientSystem {
    private container: Container;
    private sceneW: number;
    private sceneH: number;
    private particles: Particle[] = [];
    private pool: Graphics[] = [];
    private timer = 0;

    constructor(container: Container, sceneW: number, sceneH: number) {
        this.container = container;
        this.sceneW = sceneW;
        this.sceneH = sceneH;
    }

    init(): void {
        // Spawn initial fireflies/butterflies based on time
        this.spawnBatch(8);
    }

    update(ticker: Ticker): void {
        const dt = ticker.deltaTime;
        this.timer += dt;

        // Spawn new particles periodically
        if (this.timer > 120 && this.particles.length < MAX_PARTICLES) {
            this.timer = 0;
            this.spawnBatch(2);
        }

        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 6;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.container.removeChild(p.gfx);
                this.pool.push(p.gfx);
                this.particles.splice(i, 1);
                continue;
            }

            // Movement
            if (isNight) {
                // Firefly — gentle sine wave float
                p.gfx.x += p.vx * dt;
                p.gfx.y += Math.sin(p.phase + this.timer * 0.02) * 0.3 * dt;
                p.gfx.alpha = 0.3 + Math.sin(p.phase + this.timer * 0.05) * 0.3;
            } else {
                // Butterfly — drift across scene
                p.gfx.x += p.vx * dt;
                p.gfx.y += p.vy * dt + Math.sin(p.phase + this.timer * 0.03) * 0.2;
            }

            // Fade out near end of life
            const lifeRatio = p.life / p.maxLife;
            if (lifeRatio < 0.2) {
                p.gfx.alpha *= lifeRatio / 0.2;
            }
        }
    }

    private spawnBatch(count: number): void {
        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 6;

        for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
            const gfx = this.pool.length > 0 ? this.pool.pop()! : new Graphics();
            gfx.clear();

            if (isNight) {
                // Firefly
                gfx.circle(0, 0, 2).fill({ color: '#FFB347', alpha: 0.7 });
                gfx.circle(0, 0, 5).fill({ color: '#FFB347', alpha: 0.15 });
            } else {
                // Small butterfly/bird
                gfx.poly([-3, 0, 0, -2, 3, 0, 0, 1]).fill('#E8DCC8');
            }

            gfx.x = Math.random() * this.sceneW;
            gfx.y = this.sceneH * 0.2 + Math.random() * this.sceneH * 0.5;
            gfx.alpha = 0.6;

            const life = 300 + Math.random() * 300;

            this.particles.push({
                gfx,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.1,
                life,
                maxLife: life,
                phase: Math.random() * Math.PI * 2,
            });

            this.container.addChild(gfx);
        }
    }

    resize(sceneW: number, sceneH: number): void {
        this.sceneW = sceneW;
        this.sceneH = sceneH;
    }

    destroy(): void {
        for (const p of this.particles) {
            p.gfx.destroy();
        }
        for (const g of this.pool) {
            g.destroy();
        }
        this.particles = [];
        this.pool = [];
    }
}
