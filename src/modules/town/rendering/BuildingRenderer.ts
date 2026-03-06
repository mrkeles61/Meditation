import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { BuildingDefinition, BuildingLevel } from '../types/town.types';
import { BUILDING_SPRITES } from '../data/building-sprites';

// Module-level texture cache — populated by preloadBuildingSprites()
const textureCache = new Map<string, Texture>();

/**
 * Preloads all known building sprite paths into the texture cache.
 * Call once during scene init before renderBuilding().
 */
export async function preloadBuildingSprites(): Promise<void> {
    const paths = new Set<string>();
    for (const levels of Object.values(BUILDING_SPRITES)) {
        for (const path of Object.values(levels)) {
            paths.add(path);
        }
    }

    await Promise.allSettled(
        [...paths].map(async (path) => {
            try {
                const texture = await Assets.load(path);
                textureCache.set(path, texture);
            } catch {
                // Sprite not available — will fall back to Graphics
            }
        }),
    );
}

export function renderBuilding(def: BuildingDefinition, level: number): Container {
    const container = new Container();
    const bl = def.levels[Math.min(level, def.levels.length - 1)];
    const W = def.baseWidth;
    const H = def.baseHeight;

    if (level === 0) {
        drawLockedBuilding(container, W, H);
    } else {
        const spritePath = BUILDING_SPRITES[def.habitType]?.[level];
        const texture = spritePath ? textureCache.get(spritePath) : undefined;

        if (texture) {
            drawSpriteBuilding(container, W, H, texture);
        } else {
            drawIsometricBuilding(container, W, H, bl, def.habitType);
        }
    }

    // Anchor at bottom-center
    container.pivot.set(W / 2, H);

    return container;
}

function drawSpriteBuilding(container: Container, W: number, H: number, texture: Texture): void {
    // Shadow beneath sprite
    const shadow = new Graphics();
    shadow.ellipse(W / 2, H + 4, W * 0.45, W * 0.18).fill({ color: '#000000', alpha: 0.25 });
    container.addChild(shadow);

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 1.0);
    sprite.position.set(W / 2, H);

    // Scale sprite to fit within the container bounding box
    const maxW = W * 0.95;
    const maxH = H * 0.95;
    const scale = Math.min(maxW / texture.width, maxH / texture.height);
    sprite.scale.set(scale);

    container.addChild(sprite);
}

function drawLockedBuilding(container: Container, W: number, H: number) {
    const g = new Graphics();

    // Ghost wireframe
    const isoW = W * 0.5;
    const isoD = W * 0.25;
    const wallH = H * 0.55;
    const baseY = H;

    // Left face wireframe
    g.poly([
        W / 2 - isoW, baseY - wallH + isoD,
        W / 2, baseY - wallH + isoD * 2,
        W / 2, baseY + isoD,
        W / 2 - isoW, baseY,
    ]);
    g.stroke({ width: 1.5, color: '#ffffff', alpha: 0.15 });

    // Right face wireframe
    g.poly([
        W / 2, baseY - wallH + isoD * 2,
        W / 2 + isoW, baseY - wallH + isoD,
        W / 2 + isoW, baseY,
        W / 2, baseY + isoD,
    ]);
    g.stroke({ width: 1.5, color: '#ffffff', alpha: 0.12 });

    // Top face wireframe
    g.poly([
        W / 2, baseY - wallH,
        W / 2 + isoW, baseY - wallH + isoD,
        W / 2, baseY - wallH + isoD * 2,
        W / 2 - isoW, baseY - wallH + isoD,
    ]);
    g.stroke({ width: 1.5, color: '#ffffff', alpha: 0.1 });

    container.addChild(g);

    // Lock icon
    const lock = new Graphics();
    const lockX = W / 2;
    const lockY = baseY - wallH / 2;
    // Lock body
    lock.roundRect(lockX - 8, lockY - 4, 16, 14, 2).fill({ color: '#ffffff', alpha: 0.2 });
    // Lock shackle
    lock.arc(lockX, lockY - 4, 7, Math.PI, 0).stroke({ width: 2, color: '#ffffff', alpha: 0.2 });
    container.addChild(lock);
}

function drawIsometricBuilding(
    container: Container, W: number, H: number,
    bl: BuildingLevel, habitType: string,
) {
    const g = new Graphics();
    const isoW = W * 0.5;
    const isoD = W * 0.25;
    const wallH = H * 0.55;
    const baseY = H;

    const cx = W / 2;

    // ── Shadow ──
    const shadow = new Graphics();
    shadow.ellipse(cx, baseY + 6, isoW * 1.1, isoD * 0.8).fill({ color: '#000000', alpha: 0.25 });
    container.addChild(shadow);

    // ── Left face (front wall) ──
    g.poly([
        cx - isoW, baseY - wallH + isoD,
        cx, baseY - wallH + isoD * 2,
        cx, baseY + isoD,
        cx - isoW, baseY,
    ]).fill(bl.primaryColor);

    // ── Right face (side wall, darker) ──
    g.poly([
        cx, baseY - wallH + isoD * 2,
        cx + isoW, baseY - wallH + isoD,
        cx + isoW, baseY,
        cx, baseY + isoD,
    ]).fill(darken(bl.primaryColor, 25));

    // ── Top face (roof) ──
    g.poly([
        cx, baseY - wallH,
        cx + isoW, baseY - wallH + isoD,
        cx, baseY - wallH + isoD * 2,
        cx - isoW, baseY - wallH + isoD,
    ]).fill(bl.roofColor);

    // ── Roof edge highlight ──
    g.moveTo(cx - isoW, baseY - wallH + isoD);
    g.lineTo(cx, baseY - wallH);
    g.lineTo(cx + isoW, baseY - wallH + isoD);
    g.stroke({ width: 1.5, color: lighten(bl.roofColor, 30), alpha: 0.6 });

    container.addChild(g);

    // ── Details ──
    const details = new Graphics();

    // Door (on front/left face)
    if (bl.features.includes('door')) {
        const doorW = isoW * 0.3;
        const doorH = wallH * 0.35;
        const doorX = cx - isoW * 0.5;
        const doorY = baseY - doorH * 0.5;
        details.rect(doorX, doorY, doorW, doorH).fill(darken(bl.accentColor, 20));
        // Door frame
        details.rect(doorX, doorY, doorW, 2).fill(bl.accentColor);
    }

    // Windows (on front face)
    if (bl.features.includes('window')) {
        const winSize = Math.min(isoW * 0.2, 12);
        // Left window
        details.rect(cx - isoW * 0.7, baseY - wallH * 0.6, winSize, winSize).fill('#FFE082');
        // Window cross
        details.rect(cx - isoW * 0.7 + winSize / 2 - 0.5, baseY - wallH * 0.6, 1, winSize).fill(bl.primaryColor);
        details.rect(cx - isoW * 0.7, baseY - wallH * 0.6 + winSize / 2 - 0.5, winSize, 1).fill(bl.primaryColor);

        // Right side window
        const rwx = cx + isoW * 0.3;
        const rwy = baseY - wallH * 0.55;
        details.rect(rwx, rwy, winSize, winSize).fill({ color: '#FFE082', alpha: 0.8 });
        details.rect(rwx + winSize / 2 - 0.5, rwy, 1, winSize).fill(darken(bl.primaryColor, 25));
    }

    // Habit-specific decorations
    drawHabitAccents(details, cx, baseY, wallH, isoW, isoD, habitType, bl);

    container.addChild(details);
}

function drawHabitAccents(
    g: Graphics, cx: number, baseY: number, wallH: number,
    isoW: number, _isoD: number, habitType: string, bl: BuildingLevel,
) {
    switch (habitType) {
        case 'meditation':
            if (bl.features.includes('bell')) {
                // Small bell at roof peak
                g.circle(cx, baseY - wallH - 6, 4).fill('#FFD700');
                g.rect(cx - 0.5, baseY - wallH - 2, 1, 4).fill('#8B7355');
            }
            break;

        case 'gym':
            if (bl.features.includes('sign')) {
                // Dumbbell sign
                const sy = baseY - wallH * 0.3;
                g.rect(cx - isoW * 0.6 - 6, sy, 12, 3).fill(bl.accentColor);
                g.rect(cx - isoW * 0.6 - 8, sy - 2, 4, 7).fill(bl.accentColor);
                g.rect(cx - isoW * 0.6 + 4, sy - 2, 4, 7).fill(bl.accentColor);
            }
            break;

        case 'productivity':
            if (bl.features.includes('clock')) {
                // Clock face on front wall
                const clockY = baseY - wallH * 0.65;
                g.circle(cx - isoW * 0.3, clockY, 10).fill('#F5F5F5');
                g.circle(cx - isoW * 0.3, clockY, 8).fill('#424242');
                // Clock hands
                const hr = new Date().getHours() % 12;
                const hrAngle = (hr / 12) * Math.PI * 2 - Math.PI / 2;
                g.moveTo(cx - isoW * 0.3, clockY);
                g.lineTo(
                    cx - isoW * 0.3 + Math.cos(hrAngle) * 5,
                    clockY + Math.sin(hrAngle) * 5,
                );
                g.stroke({ width: 1.5, color: '#FFD700' });
            }
            break;

        case 'sleep':
            if (bl.features.includes('moon')) {
                // Moon on roof
                g.circle(cx + isoW * 0.2, baseY - wallH - 8, 6).fill('#C5CAE9');
                g.circle(cx + isoW * 0.2 + 3, baseY - wallH - 9, 5).fill(bl.roofColor);
            }
            break;

        case 'hydration':
            if (bl.features.includes('water')) {
                // Water inside the well
                g.ellipse(cx, baseY - wallH * 0.3, isoW * 0.5, 8).fill('#42A5F5');
                g.ellipse(cx - 4, baseY - wallH * 0.3 - 2, 6, 3).fill({ color: '#90CAF9', alpha: 0.6 });
            }
            break;

        case 'nutrition':
            if (bl.features.includes('chimney')) {
                // Chimney on roof
                g.rect(cx + isoW * 0.3, baseY - wallH - 16, 8, 20).fill(darken(bl.primaryColor, 30));
                g.rect(cx + isoW * 0.3 - 1, baseY - wallH - 18, 10, 4).fill(darken(bl.primaryColor, 20));
            }
            break;

        case 'reading':
        case 'journal':
            if (bl.features.includes('lamp')) {
                // Hanging lamp
                g.circle(cx - isoW * 0.6, baseY - wallH * 0.45, 4).fill({ color: '#FFB347', alpha: 0.8 });
                g.rect(cx - isoW * 0.6 - 0.5, baseY - wallH * 0.55, 1, 8).fill('#5D4037');
            }
            break;
    }

    // Glow for high-level buildings
    if (bl.features.includes('glow')) {
        g.ellipse(cx, baseY - wallH * 0.4, isoW * 1.2, wallH * 0.6);
        g.fill({ color: '#FFB347', alpha: 0.08 });
    }

    // Flag
    if (bl.features.includes('flag')) {
        g.rect(cx + isoW * 0.4, baseY - wallH - 20, 2, 24).fill('#5D4037');
        g.poly([
            cx + isoW * 0.4 + 2, baseY - wallH - 20,
            cx + isoW * 0.4 + 14, baseY - wallH - 16,
            cx + isoW * 0.4 + 2, baseY - wallH - 12,
        ]).fill('#FFB347');
    }
}

function darken(hex: string, amount: number): string {
    const c = hex.replace('#', '');
    const r = Math.max(0, parseInt(c.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(c.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(c.slice(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex: string, amount: number): string {
    const c = hex.replace('#', '');
    const r = Math.min(255, parseInt(c.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(c.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(c.slice(4, 6), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
