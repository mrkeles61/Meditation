import * as THREE from 'three';
import { ThreeDayNightSystem } from './ThreeDayNightSystem';

const MAX_PARTICLES = 30;

interface Particle {
    sprite:  THREE.Sprite;
    vx:      number;
    vz:      number;
    life:    number;
    maxLife: number;
    phase:   number;
}

/** Creates the ambient particle sprites (fireflies at night, butterflies by day). */
function makeSprite(isFirefly: boolean): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width  = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    if (isFirefly) {
        // Soft glowing dot
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 220, 80, 0.95)');
        grad.addColorStop(0.5, 'rgba(255, 180, 0, 0.5)');
        grad.addColorStop(1, 'rgba(255, 180, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
    } else {
        // Tiny butterfly / bird silhouette
        ctx.fillStyle = 'rgba(230, 220, 200, 0.85)';
        ctx.beginPath();
        ctx.ellipse(5, 8, 4, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(11, 8, 4, 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.35, 0.35, 0.35);
    return sprite;
}

export class ThreeAmbientSystem {
    private container: THREE.Object3D;
    private particles: Particle[] = [];
    private pool: THREE.Sprite[] = [];
    private timer = 0;
    private isNight = false;

    constructor(container: THREE.Object3D) {
        this.container = container;
    }

    init(): void {
        this.isNight = ThreeDayNightSystem.getPhase() === 'night';
        this.spawnBatch(10);
    }

    update(dt: number): void {
        this.timer += dt;

        // Spawn 2 more every ~2 seconds if below cap
        if (this.timer > 120 && this.particles.length < MAX_PARTICLES) {
            this.timer = 0;
            this.spawnBatch(2);
        }

        this.isNight = ThreeDayNightSystem.getPhase() === 'night';

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.container.remove(p.sprite);
                this.pool.push(p.sprite);
                this.particles.splice(i, 1);
                continue;
            }

            const t = this.timer * 0.01;

            if (this.isNight) {
                // Firefly: gentle sine float, pulsing alpha
                p.sprite.position.x += p.vx * dt;
                p.sprite.position.y += Math.sin(p.phase + t * 2) * 0.008 * dt;
                p.sprite.material.opacity = 0.4 + Math.sin(p.phase + t * 3) * 0.35;
            } else {
                // Butterfly: lazy arc drift
                p.sprite.position.x += p.vx * dt;
                p.sprite.position.z += p.vz * dt;
                p.sprite.position.y += Math.sin(p.phase + t * 1.5) * 0.005 * dt;
                p.sprite.material.opacity = 0.7;
            }

            // Fade near end of life
            const lifeRatio = p.life / p.maxLife;
            if (lifeRatio < 0.2) {
                p.sprite.material.opacity *= lifeRatio / 0.2;
            }
        }
    }

    private spawnBatch(count: number): void {
        for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
            const sprite = this.pool.length > 0 ? this.pool.pop()! : makeSprite(this.isNight);

            // Random position inside the scene
            sprite.position.set(
                (Math.random() - 0.5) * 14,
                this.isNight ? 0.5 + Math.random() * 2.5 : 2.5 + Math.random() * 2.5,
                (Math.random() - 0.5) * 12,
            );
            sprite.material.opacity = 0.7;

            const life = 300 + Math.random() * 300;

            this.particles.push({
                sprite,
                vx:      (Math.random() - 0.5) * 0.008,
                vz:      (Math.random() - 0.5) * 0.005,
                life,
                maxLife: life,
                phase:   Math.random() * Math.PI * 2,
            });

            this.container.add(sprite);
        }
    }

    destroy(): void {
        for (const p of this.particles) {
            this.container.remove(p.sprite);
            (p.sprite.material as THREE.SpriteMaterial).map?.dispose();
            p.sprite.material.dispose();
        }
        for (const s of this.pool) {
            (s.material as THREE.SpriteMaterial).map?.dispose();
            s.material.dispose();
        }
        this.particles = [];
        this.pool = [];
    }
}
