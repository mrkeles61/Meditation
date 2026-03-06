import { Application, Container, Sprite } from 'pixi.js';
import { GroundRenderer } from './GroundRenderer';
import { renderBuilding, preloadBuildingSprites } from './BuildingRenderer';
import { BUILDING_REGISTRY } from '../data/building-registry';
import { resolvePosition, getSceneScale } from '../data/scene-layout';
import type { BuildingState } from '../types/town.types';

export interface SceneBuilding {
    habitType: string;
    container: Container;
}

export class SceneRenderer {
    readonly root: Container;
    private app: Application;
    private groundRenderer: GroundRenderer;
    private groundSprite: Sprite | null = null;

    private shadowLayer: Container;
    private buildingLayer: Container;
    private effectLayer: Container;

    private buildings: Map<string, SceneBuilding> = new Map();
    private sceneW = 0;
    private sceneH = 0;

    constructor(app: Application) {
        this.app = app;
        this.groundRenderer = new GroundRenderer(app);

        this.root = new Container({ isRenderGroup: true });

        this.shadowLayer = new Container();
        this.buildingLayer = new Container();
        this.effectLayer = new Container();

        this.root.addChild(this.shadowLayer, this.buildingLayer, this.effectLayer);
    }

    async init(screenW: number, screenH: number, buildingStates: Record<string, BuildingState>): Promise<void> {
        this.sceneW = screenW;
        this.sceneH = screenH;

        // Preload all known building sprites before rendering
        await preloadBuildingSprites();

        // Scene scale for responsive sizing
        const scale = getSceneScale(screenW, screenH);

        // ── Ground ──
        const groundTex = this.groundRenderer.render(screenW, screenH);
        this.groundSprite = new Sprite(groundTex);
        this.root.addChildAt(this.groundSprite, 0);

        // ── Buildings ──
        this.renderBuildings(buildingStates, scale);

        // ── Depth sort ──
        this.sortByDepth();
    }

    renderBuildings(states: Record<string, BuildingState>, scale?: number): void {
        // Clear existing
        for (const [, sb] of this.buildings) {
            this.buildingLayer.removeChild(sb.container);
            sb.container.destroy({ children: true });
        }
        this.buildings.clear();
        this.shadowLayer.removeChildren();

        const s = scale ?? getSceneScale(this.sceneW, this.sceneH);

        for (const [habitType, def] of Object.entries(BUILDING_REGISTRY)) {
            const state = states[habitType];
            const level = state?.level ?? 0;

            const container = renderBuilding(def, level);
            const pos = resolvePosition(def.position, this.sceneW, this.sceneH);

            container.x = pos.x;
            container.y = pos.y;
            container.scale.set(pos.scale * s * 0.85);

            container.eventMode = 'static';
            container.cursor = 'pointer';
            container.label = habitType;

            this.buildingLayer.addChild(container);
            this.buildings.set(habitType, { habitType, container });
        }

        this.sortByDepth();
    }

    private sortByDepth(): void {
        const children = [...this.buildingLayer.children];
        children.sort((a, b) => a.y - b.y);
        for (let i = 0; i < children.length; i++) {
            this.buildingLayer.setChildIndex(children[i], i);
        }
    }

    getBuildingContainers(): Map<string, SceneBuilding> {
        return this.buildings;
    }

    get effectContainer(): Container {
        return this.effectLayer;
    }

    resize(screenW: number, screenH: number, states: Record<string, BuildingState>): void {
        this.sceneW = screenW;
        this.sceneH = screenH;

        // Re-render ground
        if (this.groundSprite) {
            this.root.removeChild(this.groundSprite);
            this.groundSprite.destroy();
        }
        const groundTex = this.groundRenderer.render(screenW, screenH);
        this.groundSprite = new Sprite(groundTex);
        this.root.addChildAt(this.groundSprite, 0);

        // Reposition buildings
        this.renderBuildings(states);
    }

    destroy(): void {
        this.groundRenderer.destroy();
        for (const [, sb] of this.buildings) {
            sb.container.destroy({ children: true });
        }
        this.buildings.clear();
        this.root.destroy({ children: true });
    }
}
