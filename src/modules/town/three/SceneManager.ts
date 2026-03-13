/**
 * SceneManager — top-level Three.js orchestrator for the town world.
 *
 * Lifecycle:
 *   1. new SceneManager()
 *   2. await init(canvas)       — creates renderer, scene, systems
 *   3. start()                  — starts the RAF game loop
 *   4. resize(w, h)             — call on ResizeObserver
 *   5. updateBuildings(states)  — call when Zustand store changes
 *   6. destroy()                — cleanup on React unmount
 */
import * as THREE from 'three';
import { BUILDING_REGISTRY } from '../data/building-registry';
import { normToWorld, buildGround } from './GroundBuilder';
import { createBuildingGroup } from './BuildingMeshFactory';
import { ThreeCameraSystem } from './ThreeCameraSystem';
import { ThreeDayNightSystem } from './ThreeDayNightSystem';
import { ThreeAmbientSystem } from './ThreeAmbientSystem';
import { ThreeNPCSystem } from './ThreeNPCSystem';
import { ThreeLevelUpSystem } from './ThreeLevelUpSystem';
import { disposeSharedMaterials } from './toonMaterial';
import type { BuildingState } from '../types/town.types';

export class SceneManager {
    // Three.js core
    private renderer!: THREE.WebGLRenderer;
    private scene!:    THREE.Scene;
    private camera!:   THREE.PerspectiveCamera;

    // Lights (exposed for day/night)
    private sun!:     THREE.DirectionalLight;
    private ambient!: THREE.AmbientLight;

    // Scene groups
    private groundGroup!:    THREE.Group;
    private buildingGroup!:  THREE.Group;
    private particleGroup!:  THREE.Group;

    // Systems
    private cameraSystem!:   ThreeCameraSystem;
    private dayNight!:       ThreeDayNightSystem;
    private ambientSystem!:  ThreeAmbientSystem;
    private npcSystem!:      ThreeNPCSystem;
    private levelUpSystem!:  ThreeLevelUpSystem;

    // Building tracking
    private buildingGroups: Map<string, THREE.Group> = new Map();
    private currentLevels:  Record<string, number>   = {};

    // Raycaster
    private raycaster  = new THREE.Raycaster();
    private ndcPointer = new THREE.Vector2();

    // RAF
    private rafHandle: number | null = null;
    private lastTime  = performance.now();
    private dayNightTimer = 0;

    // Callbacks → React
    onBuildingTapped: ((habitType: string) => void) | null = null;

    // ─── Init ────────────────────────────────────────────────────────────────

    async init(canvas: HTMLCanvasElement): Promise<void> {
        const w = canvas.clientWidth  || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;

        // ── Renderer ──
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias:    true,
            alpha:        false,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled  = true;
        this.renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace   = THREE.SRGBColorSpace;
        this.renderer.toneMapping        = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        // ── Scene ──
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog        = new THREE.Fog(0xB3D9FF, 30, 90);

        // ── Camera ──
        this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 200);
        this.scene.add(this.camera); // add to scene so it moves with scene if needed

        // ── Lights ──
        this.sun = new THREE.DirectionalLight(0xFFF8E1, 2.2);
        this.sun.position.set(12, 20, 10);
        this.sun.castShadow              = true;
        this.sun.shadow.mapSize.width    = 1024;
        this.sun.shadow.mapSize.height   = 1024;
        this.sun.shadow.camera.near      = 1;
        this.sun.shadow.camera.far       = 80;
        this.sun.shadow.camera.left      = -18;
        this.sun.shadow.camera.right     = 18;
        this.sun.shadow.camera.top       = 18;
        this.sun.shadow.camera.bottom    = -18;
        this.sun.shadow.bias             = -0.002;
        this.scene.add(this.sun);
        this.scene.add(this.sun.target);

        this.ambient = new THREE.AmbientLight(0xB3D9FF, 0.7);
        this.scene.add(this.ambient);

        // ── Ground ──
        this.groundGroup = buildGround();
        this.scene.add(this.groundGroup);

        // ── Buildings ──
        this.buildingGroup = new THREE.Group();
        this.buildingGroup.name = 'buildings';
        this.scene.add(this.buildingGroup);

        // ── Particles ──
        this.particleGroup = new THREE.Group();
        this.particleGroup.name = 'particles';
        this.scene.add(this.particleGroup);

        // ── Systems ──
        this.cameraSystem  = new ThreeCameraSystem(this.camera);
        this.cameraSystem.bindEvents(canvas, w, h);

        this.dayNight = new ThreeDayNightSystem(this.scene, this.sun, this.ambient);
        this.dayNight.update();

        this.ambientSystem = new ThreeAmbientSystem(this.particleGroup);
        this.ambientSystem.init();

        this.npcSystem = new ThreeNPCSystem(this.scene);
        this.npcSystem.init();

        this.levelUpSystem = new ThreeLevelUpSystem(this.scene);

        // ── Tap detection ──
        this.bindTapEvents(canvas);
    }

    // ─── Buildings ───────────────────────────────────────────────────────────

    /**
     * Rebuild only buildings whose level has changed.
     * Called from React whenever townStore.buildings changes.
     */
    updateBuildings(buildings: Record<string, BuildingState>): void {
        for (const [habitType, def] of Object.entries(BUILDING_REGISTRY)) {
            const state = buildings[habitType];
            const level = state?.level ?? 0;

            if (this.currentLevels[habitType] === level) continue; // no change

            // Remove old mesh
            const old = this.buildingGroups.get(habitType);
            if (old) {
                this.buildingGroup.remove(old);
                old.traverse((obj) => {
                    if (obj instanceof THREE.Mesh) {
                        obj.geometry.dispose();
                        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                        else obj.material.dispose();
                    }
                });
            }

            // Create new mesh
            const group = createBuildingGroup(habitType, level);
            const { x, z } = normToWorld(def.position.x, def.position.y);
            group.position.set(x, 0, z);
            this.buildingGroup.add(group);
            this.buildingGroups.set(habitType, group);
            this.currentLevels[habitType] = level;

            // Trigger level-up animation if levelling up (not initial load)
            if (state?.pendingLevelUp) {
                const worldPos = new THREE.Vector3(x, 0, z);
                this.levelUpSystem.play(worldPos, () => {
                    if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
                });
            }
        }
    }

    // ─── Raycasting / tap ────────────────────────────────────────────────────

    private bindTapEvents(canvas: HTMLCanvasElement): void {
        let downX = 0, downY = 0;

        canvas.addEventListener('pointerdown', (e: PointerEvent) => {
            downX = e.clientX;
            downY = e.clientY;
        });

        canvas.addEventListener('pointerup', (e: PointerEvent) => {
            const dx = Math.abs(e.clientX - downX);
            const dy = Math.abs(e.clientY - downY);
            if (dx > 10 || dy > 10) return; // was a drag, not a tap

            const rect = canvas.getBoundingClientRect();
            this.ndcPointer.set(
                ((e.clientX - rect.left) / rect.width)  * 2 - 1,
                -((e.clientY - rect.top)  / rect.height) * 2 + 1,
            );

            const hit = this.getIntersectedBuilding();
            if (hit && this.onBuildingTapped) {
                this.onBuildingTapped(hit);
            }
        });
    }

    private getIntersectedBuilding(): string | null {
        this.raycaster.setFromCamera(this.ndcPointer, this.camera);

        // Collect all meshes inside building groups
        const targets: THREE.Object3D[] = [];
        this.buildingGroup.traverse(obj => {
            if (obj instanceof THREE.Mesh) targets.push(obj);
        });

        const hits = this.raycaster.intersectObjects(targets, false);
        if (hits.length === 0) return null;

        // Walk up the parent chain to find the building group with habitType
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
            if (obj.userData.habitType) return obj.userData.habitType as string;
            obj = obj.parent;
        }
        return null;
    }

    // ─── Game loop ───────────────────────────────────────────────────────────

    start(): void {
        if (this.rafHandle !== null) return;
        const loop = (now: number) => {
            this.rafHandle = requestAnimationFrame(loop);
            const dt = Math.min((now - this.lastTime) / 16.67, 3); // cap at 3× slowdown
            this.lastTime = now;

            this.cameraSystem.update();
            this.ambientSystem.update(dt * 60); // scale to ~ticker units
            this.npcSystem.update(dt * 60);

            // Refresh day/night every 60 seconds
            this.dayNightTimer += dt;
            if (this.dayNightTimer > 60) {
                this.dayNightTimer = 0;
                this.dayNight.update();
            }

            this.renderer.render(this.scene, this.camera);
        };
        this.lastTime  = performance.now();
        this.rafHandle = requestAnimationFrame(loop);
    }

    stop(): void {
        if (this.rafHandle !== null) {
            cancelAnimationFrame(this.rafHandle);
            this.rafHandle = null;
        }
    }

    // ─── Resize ──────────────────────────────────────────────────────────────

    resize(w: number, h: number): void {
        this.renderer.setSize(w, h);
        this.cameraSystem.resize(w, h);
    }

    // ─── Destroy ─────────────────────────────────────────────────────────────

    destroy(): void {
        this.stop();

        this.ambientSystem.destroy();
        this.npcSystem.destroy();
        this.levelUpSystem.destroy();
        this.cameraSystem.destroy();
        this.dayNight.destroy();

        disposeSharedMaterials();

        // Dispose all geometries / materials in scene
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(m => m.dispose());
            }
            if (obj instanceof THREE.Sprite) {
                (obj.material as THREE.SpriteMaterial).map?.dispose();
                obj.material.dispose();
            }
        });

        this.renderer.dispose();
    }
}
