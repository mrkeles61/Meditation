import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { SceneRenderer } from './rendering/SceneRenderer';
import { BuildingSystem } from './systems/BuildingSystem';
import { NPCSystem } from './systems/NPCSystem';
import { DayNightSystem } from './systems/DayNightSystem';
import { AmbientSystem } from './systems/AmbientSystem';
import { CameraSystem } from './systems/CameraSystem';
import { useTownStore } from './stores/townStore';
import { BuildingPanel } from './components/BuildingPanel';
import { TownHUD } from './components/TownHUD';
import './Town.css';

export function TownScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const buildingSystemRef = useRef<BuildingSystem | null>(null);
    const [ready, setReady] = useState(false);
    const selectedBuilding = useTownStore((s) => s.selectedBuilding);

    useEffect(() => {
        if (!containerRef.current) return;

        let destroyed = false;
        let initDone = false;
        const app = new Application();
        appRef.current = app;

        let scene: SceneRenderer;
        let npcSystem: NPCSystem;
        let dayNight: DayNightSystem;
        let ambient: AmbientSystem;
        let camera: CameraSystem;

        async function init() {
            await app.init({
                resizeTo: window,
                background: '#0a0a0a',
                antialias: false,
                resolution: window.devicePixelRatio,
                autoDensity: true,
            });

            if (destroyed) return;
            initDone = true;

            containerRef.current!.appendChild(app.canvas);
            app.canvas.style.touchAction = 'none';

            // ── Scene ──
            scene = new SceneRenderer(app);
            scene.init(app.screen.width, app.screen.height, useTownStore.getState().buildings);
            app.stage.addChild(scene.root);

            // ── Camera (zoom only) ──
            camera = new CameraSystem(scene.root);
            camera.bindEvents(app.canvas);

            // ── Building interaction ──
            const buildingSystem = new BuildingSystem(scene);
            buildingSystem.bindEvents();
            buildingSystemRef.current = buildingSystem;

            // ── Tap empty space to deselect ──
            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;
            app.stage.on('pointertap', () => {
                if (useTownStore.getState().selectedBuilding) {
                    buildingSystem.deselect();
                }
            });

            // ── NPCs ──
            npcSystem = new NPCSystem(scene.effectContainer, app.screen.width, app.screen.height);
            npcSystem.init();

            // ── Day/Night ──
            dayNight = new DayNightSystem(scene.root);
            dayNight.update();

            // ── Ambient ──
            ambient = new AmbientSystem(scene.effectContainer, app.screen.width, app.screen.height);
            ambient.init();

            // ── Game Loop ──
            app.ticker.add((ticker) => {
                camera.update();
                npcSystem.update(ticker);
                ambient.update(ticker);
                // Day/night updates every ~60 frames (1 sec)
                if (ticker.lastTime % 60 < ticker.deltaTime) {
                    dayNight.update();
                }
            });

            // ── Resize ──
            const onResize = () => {
                if (!destroyed) {
                    scene.resize(app.screen.width, app.screen.height, useTownStore.getState().buildings);
                    npcSystem.resize(app.screen.width, app.screen.height);
                    ambient.resize(app.screen.width, app.screen.height);
                }
            };
            window.addEventListener('resize', onResize);

            setReady(true);
        }

        init().catch((err) => console.error('[TownScene] init failed:', err));

        return () => {
            destroyed = true;
            if (initDone && appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    return (
        <div className="town-scene" ref={containerRef}>
            <TownHUD />
            <BuildingPanel
                habitType={selectedBuilding}
                onClose={() => {
                    buildingSystemRef.current?.deselect();
                }}
            />
        </div>
    );
}
