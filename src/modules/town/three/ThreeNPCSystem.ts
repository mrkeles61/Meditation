import * as THREE from 'three';
import { NPC_ROUTES } from '../data/npc-routes';
import { normToWorld } from './GroundBuilder';

/** Draw a tiny character onto a canvas and return a CanvasTexture. */
function makeNPCTexture(accentColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width  = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // Head
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.arc(16, 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(12, 8, 2, 2);
    ctx.fillRect(18, 8, 2, 2);

    // Body
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(9, 18, 14, 14);

    // Accent scarf
    ctx.fillStyle = accentColor;
    ctx.fillRect(9, 21, 14, 4);

    // Legs
    ctx.fillStyle = '#1A252F';
    ctx.fillRect(9, 32, 5, 10);
    ctx.fillRect(18, 32, 5, 10);

    return new THREE.CanvasTexture(canvas);
}

interface NPCState {
    sprite:      THREE.Sprite;
    routeIndex:  number;
    pointIndex:  number;
    targetX:     number;
    targetZ:     number;
    paused:      boolean;
    pauseTimer:  number;
    moving:      boolean;
    bobTimer:    number;
}

export class ThreeNPCSystem {
    private container: THREE.Object3D;
    private npcs: NPCState[] = [];

    constructor(container: THREE.Object3D) {
        this.container = container;
    }

    init(): void {
        for (let i = 0; i < NPC_ROUTES.length; i++) {
            const route = NPC_ROUTES[i];

            const tex = makeNPCTexture(route.color);
            const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(0.75, 1.1, 1);

            const start = route.points[0];
            const { x, z } = normToWorld(start.x, start.y);
            sprite.position.set(x, 0.55, z);

            this.container.add(sprite);

            const npc: NPCState = {
                sprite,
                routeIndex:  i,
                pointIndex:  0,
                targetX:     x,
                targetZ:     z,
                paused:      false,
                pauseTimer:  0,
                moving:      false,
                bobTimer:    Math.random() * Math.PI * 2,
            };

            this.npcs.push(npc);
            this.setNextTarget(npc);
        }
    }

    private setNextTarget(npc: NPCState): void {
        const route = NPC_ROUTES[npc.routeIndex];
        npc.pointIndex = (npc.pointIndex + 1) % route.points.length;
        const pt = route.points[npc.pointIndex];
        const { x, z } = normToWorld(pt.x, pt.y);
        npc.targetX = x;
        npc.targetZ = z;
        npc.moving  = true;
    }

    /** Call every frame with deltaTime in "ticker units" (~1 at 60fps). */
    update(dt: number): void {
        for (const npc of this.npcs) {
            npc.bobTimer += dt * 0.05;

            if (npc.paused) {
                npc.pauseTimer -= dt;
                npc.sprite.position.y = 0.55 + Math.sin(npc.bobTimer) * 0.03;
                if (npc.pauseTimer <= 0) {
                    npc.paused = false;
                    this.setNextTarget(npc);
                }
                continue;
            }

            const dx = npc.targetX - npc.sprite.position.x;
            const dz = npc.targetZ - npc.sprite.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            const route = NPC_ROUTES[npc.routeIndex];
            const speed = route.speed * 0.04 * dt;

            if (dist < speed + 0.01) {
                npc.sprite.position.x = npc.targetX;
                npc.sprite.position.z = npc.targetZ;
                npc.moving     = false;
                npc.paused     = true;
                npc.pauseTimer = 120 + Math.random() * 60;
            } else {
                npc.sprite.position.x += (dx / dist) * speed;
                npc.sprite.position.z += (dz / dist) * speed;
                // Walking bob
                npc.sprite.position.y = 0.55 + Math.abs(Math.sin(npc.bobTimer * 3)) * 0.08;
            }

            // Y-sort via renderOrder (higher Z = closer to camera = rendered last = on top)
            npc.sprite.renderOrder = Math.round(npc.sprite.position.z * 10);
        }
    }

    destroy(): void {
        for (const npc of this.npcs) {
            this.container.remove(npc.sprite);
            (npc.sprite.material as THREE.SpriteMaterial).map?.dispose();
            npc.sprite.material.dispose();
        }
        this.npcs = [];
    }
}
