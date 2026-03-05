import { Application, Container, Graphics, RenderTexture } from 'pixi.js';
import { PATH_CONTROL_POINTS, POND_POSITION, TREE_POSITIONS } from '../data/scene-layout';

export class GroundRenderer {
    private app: Application;
    private cachedTexture: RenderTexture | null = null;

    constructor(app: Application) {
        this.app = app;
    }

    render(sceneW: number, sceneH: number): RenderTexture {
        if (this.cachedTexture) {
            this.cachedTexture.destroy(true);
        }

        const container = new Container();

        // 1. Background fade
        const bg = new Graphics();
        bg.rect(0, 0, sceneW, sceneH).fill('#0a0a0a');
        container.addChild(bg);

        // 2. Isometric ground diamond
        const ground = this.drawGroundDiamond(sceneW, sceneH);
        container.addChild(ground);

        // 3. Grass variation patches
        const patches = this.drawGrassPatches(sceneW, sceneH);
        container.addChild(patches);

        // 4. Path connecting buildings
        const path = this.drawPath(sceneW, sceneH);
        container.addChild(path);

        // 5. Pond
        const pond = this.drawPond(sceneW, sceneH);
        container.addChild(pond);

        // 6. Flower clusters
        const flowers = this.drawFlowers(sceneW, sceneH);
        container.addChild(flowers);

        // 7. Vignette edges
        const vignette = this.drawVignette(sceneW, sceneH);
        container.addChild(vignette);

        const texture = RenderTexture.create({ width: sceneW, height: sceneH });
        this.app.renderer.render({ container, target: texture });
        container.destroy({ children: true });

        this.cachedTexture = texture;
        return texture;
    }

    private drawGroundDiamond(w: number, h: number): Graphics {
        const g = new Graphics();
        const cx = w / 2;
        const cy = h * 0.48;
        const halfW = w * 0.48;
        const halfH = h * 0.32;

        // Main isometric diamond
        g.poly([
            cx, cy - halfH,       // top
            cx + halfW, cy,       // right
            cx, cy + halfH,       // bottom
            cx - halfW, cy,       // left
        ]).fill('#3a6b35');

        // Lighter inner area for depth
        const innerW = halfW * 0.85;
        const innerH = halfH * 0.85;
        g.poly([
            cx, cy - innerH,
            cx + innerW, cy,
            cx, cy + innerH,
            cx - innerW, cy,
        ]).fill('#3f7a3a');

        // Even lighter center for near-camera feel
        const coreW = halfW * 0.6;
        const coreH = halfH * 0.6;
        const coreCy = cy + halfH * 0.15;
        g.poly([
            cx, coreCy - coreH,
            cx + coreW, coreCy,
            cx, coreCy + coreH,
            cx - coreW, coreCy,
        ]).fill('#4a8b45');

        return g;
    }

    private drawGrassPatches(w: number, h: number): Graphics {
        const g = new Graphics();
        const cx = w / 2;
        const cy = h * 0.48;

        // Scattered darker/lighter patches for natural variation
        const patches = [
            { x: cx - w * 0.15, y: cy - h * 0.05, r: 25, color: '#2d5a1e' },
            { x: cx + w * 0.20, y: cy + h * 0.08, r: 30, color: '#4f9a48' },
            { x: cx - w * 0.25, y: cy + h * 0.12, r: 20, color: '#2d5a1e' },
            { x: cx + w * 0.10, y: cy - h * 0.10, r: 22, color: '#357a2e' },
            { x: cx - w * 0.05, y: cy + h * 0.18, r: 28, color: '#4f9a48' },
            { x: cx + w * 0.30, y: cy - h * 0.02, r: 18, color: '#2d5a1e' },
        ];

        for (const p of patches) {
            g.ellipse(p.x, p.y, p.r, p.r * 0.6).fill({ color: p.color, alpha: 0.5 });
        }

        return g;
    }

    private drawPath(w: number, h: number): Graphics {
        const g = new Graphics();
        const points = PATH_CONTROL_POINTS.map(p => ({ x: p.x * w, y: p.y * h }));

        if (points.length < 2) return g;

        // Draw thick sandy path using line segments with round ends
        g.setStrokeStyle({ width: 18, color: '#B8976A', alpha: 0.9, cap: 'round', join: 'round' });
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            const cpy = (prev.y + curr.y) / 2;
            g.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        const last = points[points.length - 1];
        g.lineTo(last.x, last.y);
        g.stroke();

        // Lighter inner path
        g.setStrokeStyle({ width: 10, color: '#C4A882', alpha: 0.7, cap: 'round', join: 'round' });
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            const cpy = (prev.y + curr.y) / 2;
            g.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        g.lineTo(last.x, last.y);
        g.stroke();

        return g;
    }

    private drawPond(w: number, h: number): Graphics {
        const g = new Graphics();
        const px = POND_POSITION.x * w;
        const py = POND_POSITION.y * h;

        // Pond shadow/bank
        g.ellipse(px, py, 38, 22).fill({ color: '#1a4a2e', alpha: 0.6 });
        // Water
        g.ellipse(px, py, 32, 18).fill('#2E6B8A');
        // Highlight
        g.ellipse(px - 6, py - 4, 14, 7).fill({ color: '#3A7FA0', alpha: 0.7 });
        // Sparkle
        g.ellipse(px - 10, py - 5, 4, 2).fill({ color: '#7FC4E8', alpha: 0.5 });

        return g;
    }

    private drawFlowers(w: number, h: number): Graphics {
        const g = new Graphics();
        const cx = w / 2;
        const cy = h * 0.48;

        const clusters = [
            { x: cx - w * 0.18, y: cy + h * 0.08 },
            { x: cx + w * 0.15, y: cy + h * 0.15 },
            { x: cx - w * 0.30, y: cy + h * 0.02 },
            { x: cx + w * 0.05, y: cy + h * 0.22 },
        ];

        const colors = ['#FFB347', '#FF6B6B', '#9B59B6', '#FFD700', '#E91E63'];

        for (const cluster of clusters) {
            for (let i = 0; i < 5; i++) {
                const fx = cluster.x + seeded(i * 7, 20) - 10;
                const fy = cluster.y + seeded(i * 13, 12) - 6;
                g.circle(fx, fy, 2).fill(colors[i % colors.length]);
            }
        }

        return g;
    }

    private drawVignette(w: number, h: number): Graphics {
        const g = new Graphics();

        // Soft dark edges — four gradual rectangles
        // Top
        g.rect(0, 0, w, h * 0.15).fill({ color: '#0a0a0a', alpha: 0.6 });
        g.rect(0, 0, w, h * 0.08).fill({ color: '#0a0a0a', alpha: 0.3 });
        // Bottom
        g.rect(0, h * 0.85, w, h * 0.15).fill({ color: '#0a0a0a', alpha: 0.6 });
        g.rect(0, h * 0.92, w, h * 0.08).fill({ color: '#0a0a0a', alpha: 0.3 });
        // Left
        g.rect(0, 0, w * 0.05, h).fill({ color: '#0a0a0a', alpha: 0.5 });
        // Right
        g.rect(w * 0.95, 0, w * 0.05, h).fill({ color: '#0a0a0a', alpha: 0.5 });

        return g;
    }

    destroy(): void {
        if (this.cachedTexture) {
            this.cachedTexture.destroy(true);
            this.cachedTexture = null;
        }
    }
}

function seeded(seed: number, max: number): number {
    return ((seed * 2654435761) >>> 0) % max;
}
