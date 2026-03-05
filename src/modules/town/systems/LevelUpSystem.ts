import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class LevelUpSystem {
    private sceneContainer: Container;
    private active = false;

    constructor(sceneContainer: Container) {
        this.sceneContainer = sceneContainer;
    }

    async play(buildingContainer: Container): Promise<void> {
        if (this.active) return;
        this.active = true;

        const cx = buildingContainer.x;
        const cy = buildingContainer.y - buildingContainer.height / 2;

        // ── 1. Screen flash ──
        const flash = new Graphics();
        flash.rect(0, 0, 10000, 10000).fill({ color: '#ffffff', alpha: 0 });
        this.sceneContainer.addChild(flash);

        await this.tween(flash, { alpha: 0.3 }, 150);
        await this.tween(flash, { alpha: 0 }, 150);
        this.sceneContainer.removeChild(flash);
        flash.destroy();

        // ── 2. Building bounce (scale up) ──
        const origSX = buildingContainer.scale.x;
        const origSY = buildingContainer.scale.y;
        await this.tween(buildingContainer.scale, { x: origSX * 1.15, y: origSY * 1.2 }, 300);

        // ── 3. Sparkle burst ──
        const sparkles: Graphics[] = [];
        for (let i = 0; i < 20; i++) {
            const s = new Graphics();
            s.circle(0, 0, 2 + Math.random() * 2).fill(Math.random() > 0.5 ? '#FFD700' : '#FFB347');
            s.x = cx;
            s.y = cy;
            s.alpha = 1;
            this.sceneContainer.addChild(s);
            sparkles.push(s);
        }

        // Animate sparkles outward
        const sparklePromises = sparkles.map((s, i) => {
            const angle = (i / sparkles.length) * Math.PI * 2;
            const dist = 40 + Math.random() * 40;
            const tx = cx + Math.cos(angle) * dist;
            const ty = cy + Math.sin(angle) * dist;
            return this.tween(s, { x: tx, y: ty, alpha: 0 }, 600);
        });

        // ── 4. Floating text ──
        const text = new Text({
            text: '+1 LEVEL!',
            style: new TextStyle({
                fontFamily: 'sans-serif',
                fontSize: 18,
                fontWeight: 'bold',
                fill: '#FFD700',
                dropShadow: { alpha: 0.8, blur: 4, distance: 1, color: '#000000' },
            }),
        });
        text.anchor.set(0.5);
        text.x = cx;
        text.y = cy - 20;
        this.sceneContainer.addChild(text);

        const textRise = this.tween(text, { y: cy - 70, alpha: 0 }, 1200);

        await Promise.all([...sparklePromises, textRise]);

        // Cleanup sparkles
        for (const s of sparkles) {
            this.sceneContainer.removeChild(s);
            s.destroy();
        }
        this.sceneContainer.removeChild(text);
        text.destroy();

        // ── 5. Bounce back ──
        await this.tween(buildingContainer.scale, { x: origSX, y: origSY }, 400);

        // Haptic
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 80]);
        }

        this.active = false;
    }

    private tween(target: any, props: Record<string, number>, duration: number): Promise<void> {
        return new Promise((resolve) => {
            const start: Record<string, number> = {};
            for (const key of Object.keys(props)) {
                start[key] = target[key];
            }
            const startTime = performance.now();

            function step(now: number) {
                const t = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

                for (const key of Object.keys(props)) {
                    target[key] = start[key] + (props[key] - start[key]) * ease;
                }

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }
}
