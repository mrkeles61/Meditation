import { useEffect, useRef } from 'react';

const WORLD_W = 32000;
const WORLD_H = 20000;
const TILE = 128;

export function PixiWorld() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let destroyed = false;

        (async () => {
            const PIXI = await import('pixi.js');
            if (destroyed) return;

            const app = new PIXI.Application();
            await app.init({
                background: '#1a1a2e',
                resizeTo: containerRef.current!,
                antialias: true,
            });
            if (destroyed) { app.destroy(true); return; }

            containerRef.current!.appendChild(app.canvas);
            app.canvas.style.touchAction = 'none';
            app.canvas.style.imageRendering = 'pixelated';

            const world = new PIXI.Container();
            app.stage.addChild(world);

            // -- Ground --
            const ground = new PIXI.Graphics();
            ground.rect(0, 0, WORLD_W, WORLD_H);
            ground.fill(0x3d3227);

            for (let x = 0; x <= WORLD_W; x += TILE) {
                ground.moveTo(x, 0);
                ground.lineTo(x, WORLD_H);
            }
            for (let y = 0; y <= WORLD_H; y += TILE) {
                ground.moveTo(0, y);
                ground.lineTo(WORLD_W, y);
            }
            ground.stroke({ color: 0x4d4237, width: 1, alpha: 0.3 });

            // Grass patches — scattered across the huge world
            const grassPatches = [
                { x: 1000, y: 2000, w: 3000, h: 2000 },
                { x: 6000, y: 1000, w: 4000, h: 2500 },
                { x: 12000, y: 4000, w: 5000, h: 3000 },
                { x: 20000, y: 2000, w: 4000, h: 3500 },
                { x: 4000, y: 8000, w: 3500, h: 2800 },
                { x: 15000, y: 12000, w: 6000, h: 4000 },
                { x: 24000, y: 8000, w: 4000, h: 3000 },
                { x: 8000, y: 14000, w: 5000, h: 3000 },
                { x: 26000, y: 14000, w: 3500, h: 2500 },
                { x: 2000, y: 16000, w: 4000, h: 2500 },
            ];
            for (const gp of grassPatches) {
                ground.roundRect(gp.x, gp.y, gp.w, gp.h, 40);
                ground.fill({ color: 0x3a4a2a, alpha: 0.3 });
            }
            world.addChild(ground);

            // -- Trees (spread across world) --
            const rng = (min: number, max: number) => min + Math.random() * (max - min);
            const treeCount = 200;
            for (let i = 0; i < treeCount; i++) {
                const tx = rng(200, WORLD_W - 200);
                const ty = rng(200, WORLD_H - 200);
                const tree = new PIXI.Graphics();
                const sz = rng(0.8, 1.5);
                tree.rect(tx - 4 * sz, ty, 8 * sz, 24 * sz);
                tree.fill(0x6B4226);
                tree.circle(tx, ty - 6 * sz, 18 * sz);
                tree.fill({ color: 0x4a7a3a, alpha: 0.8 });
                tree.circle(tx - 8 * sz, ty, 13 * sz);
                tree.fill({ color: 0x3d6a2d, alpha: 0.7 });
                tree.circle(tx + 8 * sz, ty, 13 * sz);
                tree.fill({ color: 0x3d6a2d, alpha: 0.7 });
                world.addChild(tree);
            }

            // -- Roads --
            const road = new PIXI.Graphics();

            // Main horizontal road
            road.moveTo(2000, 10000);
            road.bezierCurveTo(8000, 9600, 12000, 10400, 16000, 10000);
            road.bezierCurveTo(20000, 9600, 24000, 10400, 30000, 10000);
            road.stroke({ color: 0x5D4E37, width: 64, alpha: 0.6, cap: 'round', join: 'round' });

            // Vertical crossing road
            road.moveTo(16000, 2000);
            road.bezierCurveTo(15600, 6000, 16400, 8000, 16000, 10000);
            road.bezierCurveTo(15600, 12000, 16400, 16000, 16000, 18000);
            road.stroke({ color: 0x5D4E37, width: 64, alpha: 0.6, cap: 'round', join: 'round' });

            // Road dots
            for (let t = 0; t <= 1; t += 0.01) {
                const x = 2000 + t * 28000;
                const y = 10000 + Math.sin(t * Math.PI * 4) * 400;
                road.circle(x, y, 3);
                road.fill({ color: 0x7D6E57, alpha: 0.4 });
            }
            world.addChild(road);

            // -- Buildings --

            // Gym (real PNG) — center of world
            const gymTexture = await PIXI.Assets.load('/buildings/gym-level-2.png');
            if (destroyed) { app.destroy(true); return; }
            const gym = new PIXI.Sprite(gymTexture);
            gym.anchor.set(0.5, 0.9);
            gym.x = 16000;
            gym.y = 10000;
            gym.scale.set(0.25);
            gym.eventMode = 'none';
            world.addChild(gym);

            const gymLabel = new PIXI.Text({
                text: 'GYM  ·  Lv 2',
                style: { fontSize: 16, fill: '#c8956c', fontFamily: 'monospace' },
            });
            gymLabel.anchor.set(0.5, 0);
            gymLabel.x = 16000;
            gymLabel.y = gym.y + 12;
            world.addChild(gymLabel);

            // Temple placeholder — west of gym
            const temple = new PIXI.Graphics();
            temple.roundRect(0, 0, 260, 340, 12);
            temple.fill({ color: 0x4a4060, alpha: 0.25 });
            temple.stroke({ color: 0x6a5a80, width: 2 });
            temple.x = 8000 - 130;
            temple.y = 10000 - 340;
            temple.eventMode = 'none';
            world.addChild(temple);

            const templeLabel = new PIXI.Text({
                text: 'TEMPLE',
                style: { fontSize: 16, fill: '#6a5a80', fontFamily: 'monospace' },
            });
            templeLabel.anchor.set(0.5, 0);
            templeLabel.x = 8000;
            templeLabel.y = 10020;
            world.addChild(templeLabel);

            // Trail placeholder — east of gym
            const trail = new PIXI.Graphics();
            trail.roundRect(0, 0, 280, 200, 12);
            trail.fill({ color: 0x3a5a3e, alpha: 0.25 });
            trail.stroke({ color: 0x5a8a5e, width: 2 });
            trail.x = 24000 - 140;
            trail.y = 10000 - 200;
            trail.eventMode = 'none';
            world.addChild(trail);

            const trailLabel = new PIXI.Text({
                text: 'TRAIL',
                style: { fontSize: 16, fill: '#5a8a5e', fontFamily: 'monospace' },
            });
            trailLabel.anchor.set(0.5, 0);
            trailLabel.x = 24000;
            trailLabel.y = 10020;
            world.addChild(trailLabel);

            // -- Animated Character (walk cycle) --
            const charTexture = await PIXI.Assets.load('/characters/character-walk.png');
            if (destroyed) { app.destroy(true); return; }
            charTexture.source.scaleMode = 'nearest';
            const FRAME_W = 48;
            const FRAME_H = 48;
            const FRAME_COUNT = 6;
            const frames: InstanceType<typeof PIXI.Texture>[] = [];
            for (let i = 0; i < FRAME_COUNT; i++) {
                const frame = new PIXI.Rectangle(i * FRAME_W, 0, FRAME_W, FRAME_H);
                frames.push(new PIXI.Texture({ source: charTexture.source, frame }));
            }
            const character = new PIXI.AnimatedSprite(frames);
            character.anchor.set(0.5, 1);
            character.x = 16000;
            character.y = gym.y + 60;
            character.scale.set(2);
            character.roundPixels = true;
            character.animationSpeed = 0.12;
            character.play();
            character.eventMode = 'none';
            world.addChild(character);

            // -- Center camera on gym --
            world.x = -(16000 - app.screen.width / 2);
            world.y = -(10000 - app.screen.height / 2);

            // -- Pan logic (drag + inertia) --
            let dragging = false;
            let lastX = 0, lastY = 0;
            let velX = 0, velY = 0;

            const clamp = (v: number, min: number, max: number) =>
                Math.max(min, Math.min(max, v));

            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;

            app.stage.on('pointerdown', (e) => {
                dragging = true;
                velX = 0;
                velY = 0;
                lastX = e.globalX;
                lastY = e.globalY;
                app.canvas.style.cursor = 'grabbing';
            });

            app.stage.on('pointermove', (e) => {
                if (!dragging) return;
                const dx = e.globalX - lastX;
                const dy = e.globalY - lastY;
                velX = dx * 0.6 + velX * 0.4;
                velY = dy * 0.6 + velY * 0.4;
                lastX = e.globalX;
                lastY = e.globalY;
                world.x = clamp(world.x + dx, -(WORLD_W - app.screen.width), 0);
                world.y = clamp(world.y + dy, -(WORLD_H - app.screen.height), 0);
            });

            const stopDrag = () => {
                dragging = false;
                app.canvas.style.cursor = 'grab';
            };
            app.stage.on('pointerup', stopDrag);
            app.stage.on('pointerupoutside', stopDrag);

            app.ticker.add(() => {
                if (!dragging && (Math.abs(velX) > 0.3 || Math.abs(velY) > 0.3)) {
                    velX *= 0.93;
                    velY *= 0.93;
                    world.x = clamp(world.x + velX, -(WORLD_W - app.screen.width), 0);
                    world.y = clamp(world.y + velY, -(WORLD_H - app.screen.height), 0);
                }
            });

            app.canvas.style.cursor = 'grab';
        })();

        return () => { destroyed = true; };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: 'calc(100dvh - 60px)',
                overflow: 'hidden',
            }}
        />
    );
}
