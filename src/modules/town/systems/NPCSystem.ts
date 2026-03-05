import type { Container, Ticker } from 'pixi.js';
import { NPCRenderer } from '../rendering/NPCRenderer';
import { NPC_ROUTES } from '../data/npc-routes';

interface NPCState {
    renderer: NPCRenderer;
    routeIndex: number;
    pointIndex: number;
    targetX: number;
    targetY: number;
    paused: boolean;
    pauseTimer: number;
    moving: boolean;
}

export class NPCSystem {
    private npcs: NPCState[] = [];
    private sceneContainer: Container;
    private sceneW: number;
    private sceneH: number;

    constructor(sceneContainer: Container, sceneW: number, sceneH: number) {
        this.sceneContainer = sceneContainer;
        this.sceneW = sceneW;
        this.sceneH = sceneH;
    }

    init(): void {
        for (let i = 0; i < NPC_ROUTES.length; i++) {
            const route = NPC_ROUTES[i];
            const renderer = new NPCRenderer(route.color);
            renderer.container.scale.set(0.8);

            const start = route.points[0];
            const sx = start.x * this.sceneW;
            const sy = start.y * this.sceneH;
            renderer.setPosition(sx, sy);

            this.sceneContainer.addChild(renderer.container);

            this.npcs.push({
                renderer,
                routeIndex: i,
                pointIndex: 0,
                targetX: sx,
                targetY: sy,
                paused: false,
                pauseTimer: 0,
                moving: false,
            });

            this.setNextTarget(this.npcs[i]);
        }
    }

    private setNextTarget(npc: NPCState): void {
        const route = NPC_ROUTES[npc.routeIndex];
        npc.pointIndex = (npc.pointIndex + 1) % route.points.length;
        const pt = route.points[npc.pointIndex];
        npc.targetX = pt.x * this.sceneW;
        npc.targetY = pt.y * this.sceneH;
        npc.moving = true;
    }

    update(ticker: Ticker): void {
        const dt = ticker.deltaTime;

        for (const npc of this.npcs) {
            if (npc.paused) {
                npc.pauseTimer -= dt;
                if (npc.pauseTimer <= 0) {
                    npc.paused = false;
                    this.setNextTarget(npc);
                }
                npc.renderer.update(false);
                continue;
            }

            const dx = npc.targetX - npc.renderer.container.x;
            const dy = npc.targetY - npc.renderer.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const route = NPC_ROUTES[npc.routeIndex];
            const speed = route.speed * dt;

            if (dist < speed + 1) {
                npc.renderer.setPosition(npc.targetX, npc.targetY);
                npc.moving = false;
                npc.paused = true;
                npc.pauseTimer = 60 + Math.random() * 120; // 1-3 seconds at 60fps
            } else {
                const nx = dx / dist;
                const ny = dy / dist;
                npc.renderer.setPosition(
                    npc.renderer.container.x + nx * speed,
                    npc.renderer.container.y + ny * speed,
                );
            }

            npc.renderer.update(npc.moving);
        }
    }

    resize(sceneW: number, sceneH: number): void {
        this.sceneW = sceneW;
        this.sceneH = sceneH;

        for (const npc of this.npcs) {
            const route = NPC_ROUTES[npc.routeIndex];
            const pt = route.points[npc.pointIndex];
            npc.targetX = pt.x * sceneW;
            npc.targetY = pt.y * sceneH;
        }
    }

    destroy(): void {
        for (const npc of this.npcs) {
            npc.renderer.destroy();
        }
        this.npcs = [];
    }
}
