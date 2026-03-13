/**
 * BuildingMeshFactory — procedural voxel buildings.
 *
 * Each building type has 4 visual levels (0-3):
 *   0 = locked scaffold (grey wireframe feel)
 *   1 = basic unlocked
 *   2 = upgraded
 *   3 = max level (glow + bonus details)
 *
 * Every building is a THREE.Group positioned at origin (y=0 = ground).
 * The caller places the group in world space.
 *
 * Art direction: bright Stardew Valley / Crossy Road palette, chunky
 * boxes, MeshToonMaterial for that cartoon cel-shade look.
 */
import * as THREE from 'three';
import { toon } from './toonMaterial';

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
    // shared neutrals
    white:      0xFAFAFA,
    darkwood:   0x5D4037,
    lightwood:  0x8D6E63,
    stone:      0x90A4AE,
    darkstone:  0x607D8B,
    sand:       0xFFECB3,
    gold:       0xFFD600,
    // meditation
    medWall:    0xF5E6C8,
    medRoof1:   0xE53935,
    medRoof2:   0xB71C1C,
    medAccent:  0xFFD600,
    // gym
    gymWall:    0x1565C0,
    gymRoof:    0xE53935,
    gymAccent:  0xFF6F00,
    // library
    libWall:    0x2E7D32,
    libRoof:    0x1B5E20,
    libWindow:  0xF9A825,
    libAccent:  0x6D4C41,
    // nutrition / kitchen
    kitWall:    0xFFF8E1,
    kitRoof:    0xE65100,
    kitChimney: 0xA1887F,
    kitAccent:  0x43A047,
    // sleep / rest
    sleepWall:  0xCFD8DC,
    sleepRoof:  0x4527A0,
    sleepMoon:  0xF3E5F5,
    // hydration / well
    wellStone:  0x90A4AE,
    wellRoof:   0x546E7A,
    wellWater:  0x1E88E5,
    // productivity / clock tower
    clockWall:  0xECEFF1,
    clockRoof:  0x546E7A,
    clockFace:  0x212121,
    clockHand:  0xFFD600,
    // journal / bookshop
    bookWall:   0xBF360C,
    bookRoof:   0x880E4F,
    bookLamp:   0xF9A825,
};

// ─── Core helper ─────────────────────────────────────────────────────────────

/**
 * Add a box to `group`.  `yBase` is the world Y at the bottom of the box.
 * Uses MeshToonMaterial for cel-shading.
 */
function box(
    group: THREE.Group,
    x: number,
    yBase: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number,
    opts: { emissive?: number; emissiveInt?: number; shadow?: boolean } = {},
): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = toon(color, {
        emissive:          opts.emissive,
        emissiveIntensity: opts.emissiveInt,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, yBase + h / 2, z);
    mesh.castShadow = opts.shadow !== false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
}

/** Invisible bounding-box hitbox for raycasting (easier tap detection on mobile). */
function addHitbox(group: THREE.Group, w: number, h: number, d: number, yBase: number): void {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, yBase + h / 2, 0);
    group.add(mesh);
}

/** Tiny glow sphere for max-level buildings. */
function glowOrb(group: THREE.Group, x: number, y: number, z: number, color: number, r = 0.18): void {
    const geo = new THREE.SphereGeometry(r, 8, 6);
    const mat = toon(color, { emissive: color, emissiveInt: 1.0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
}

/** Scaffold / locked building for level 0 — same shape but greyed out + X-bars. */
function buildLocked(footprintW: number, maxH: number, footprintD: number): THREE.Group {
    const group = new THREE.Group();

    // Ghost frame
    box(group, 0, 0, 0, footprintW, maxH, footprintD, 0x455A64, { shadow: false });
    // Semi-transparent overlay so it looks "unbuilt"
    const overlayGeo = new THREE.BoxGeometry(footprintW + 0.05, maxH + 0.05, footprintD + 0.05);
    const overlayMat = new THREE.MeshBasicMaterial({
        color:       0x546E7A,
        transparent: true,
        opacity:     0.55,
        depthWrite:  false,
    });
    const overlay = new THREE.Mesh(overlayGeo, overlayMat);
    overlay.position.set(0, maxH / 2, 0);
    group.add(overlay);

    // Lock icon (small yellow box on top)
    box(group, 0, maxH + 0.05, 0, 0.4, 0.3, 0.2, 0xFDD835);
    box(group, 0, maxH + 0.25, 0, 0.25, 0.25, 0.15, 0xFDD835);

    addHitbox(group, footprintW + 0.5, maxH + 0.6, footprintD + 0.5, 0);
    return group;
}

// ─── MEDITATION TEMPLE (Pagoda) ───────────────────────────────────────────────

function buildMeditation(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(2.2, 2.8, 2.2);

    // Base platform
    box(g, 0, 0, 0, 2.4, 0.2, 2.4, C.medWall);

    // Level 1 — single pagoda block + roof
    box(g, 0, 0.2, 0, 1.8, 1.1, 1.8, C.medWall);        // walls
    box(g, 0, 1.3, 0, 2.1, 0.25, 2.1, C.medRoof1);       // lower eave
    box(g, 0, 1.55, 0, 1.6, 0.18, 1.6, C.medRoof1);      // upper roof
    box(g, 0, 1.73, 0, 0.7, 0.25, 0.7, C.medRoof2);      // tip
    // Door
    box(g, 0, 0.2, 0.91, 0.4, 0.7, 0.05, C.darkwood);

    if (level >= 2) {
        // Second story
        box(g, 0, 1.98, 0, 1.2, 0.85, 1.2, C.medWall);
        box(g, 0, 2.83, 0, 1.45, 0.22, 1.45, C.medRoof1);
        box(g, 0, 3.05, 0, 1.0, 0.18, 1.0, C.medRoof2);
        box(g, 0, 3.23, 0, 0.45, 0.2, 0.45, C.medRoof2);
        // Windows L2
        box(g, 0.62, 0.6, 0.91, 0.35, 0.35, 0.05, C.lightwood);
        box(g, -0.62, 0.6, 0.91, 0.35, 0.35, 0.05, C.lightwood);
    }

    if (level >= 3) {
        // Golden spire on top
        box(g, 0, 3.43, 0, 0.12, 0.6, 0.12, C.gold, { emissive: C.gold, emissiveInt: 0.4 });
        // Bell
        glowOrb(g, 0, 4.1, 0, C.gold, 0.2);
        // Front torii gate pillars
        box(g, -0.9, 0, -1.4, 0.18, 1.4, 0.18, C.medRoof2);
        box(g, 0.9, 0, -1.4, 0.18, 1.4, 0.18, C.medRoof2);
        box(g, 0, 1.4, -1.4, 2.1, 0.18, 0.18, C.medRoof2);
        // Glow orbs flanking
        glowOrb(g, -0.9, 0.7, 0.95, 0xFFBF00, 0.12);
        glowOrb(g, 0.9, 0.7, 0.95, 0xFFBF00, 0.12);
    }

    addHitbox(g, 3.0, 4.5, 3.0, 0);
    return g;
}

// ─── GYM (Fitness Center) ────────────────────────────────────────────────────

function buildGym(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(2.2, 2.0, 2.0);

    // Foundation
    box(g, 0, 0, 0, 0.3, 2.0, 2.2, C.gymWall);    // far wall
    box(g, 0, 0, 0, 2.2, 0.25, 2.0, C.gymRoof);    // roof flat

    // Level 1 — boxy gym, strong horizontal lines
    box(g, 0, 0, 0, 2.2, 1.5, 1.9, C.gymWall);
    box(g, 0, 1.5, 0, 2.4, 0.3, 2.1, C.gymRoof);   // roof slab
    // Door
    box(g, 0, 0, 0.96, 0.5, 0.9, 0.05, 0x1A237E);
    // Gym sign (bar above door)
    box(g, 0, 0.95, 0.96, 1.2, 0.25, 0.07, C.gymAccent);

    if (level >= 2) {
        // Extended wing left
        box(g, -1.4, 0, 0, 0.6, 1.1, 1.6, C.gymWall);
        box(g, -1.4, 1.1, 0, 0.65, 0.22, 1.65, C.gymRoof);
        // Big windows (dark rectangles on wall)
        box(g, 0.4, 0.6, 0.96, 0.5, 0.55, 0.06, 0xBBDEFB);
        box(g, -0.4, 0.6, 0.96, 0.5, 0.55, 0.06, 0xBBDEFB);
    }

    if (level >= 3) {
        // Roof deck / skylight
        box(g, 0, 1.8, 0, 1.8, 0.18, 1.5, 0x78909C);
        // Dumbbell on roof
        box(g, 0, 2.0, 0, 0.8, 0.14, 0.14, C.gymAccent);
        box(g, -0.45, 2.0, 0, 0.22, 0.3, 0.22, C.gymAccent);
        box(g, 0.45, 2.0, 0, 0.22, 0.3, 0.22, C.gymAccent);
        // Glow trim around roof
        box(g, 0, 1.78, 0, 2.42, 0.07, 2.12, C.gymAccent,
            { emissive: C.gymAccent, emissiveInt: 0.5 });
        // Flag pole
        box(g, 1.1, 1.8, -0.9, 0.07, 0.9, 0.07, C.darkwood);
        box(g, 1.35, 2.35, -0.9, 0.5, 0.28, 0.07, C.gymAccent,
            { emissive: C.gymAccent, emissiveInt: 0.3 });
    }

    addHitbox(g, 3.2, 3.2, 2.8, 0);
    return g;
}

// ─── LIBRARY ─────────────────────────────────────────────────────────────────

function buildLibrary(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.9, 2.2, 1.7);

    // Base
    box(g, 0, 0, 0, 1.8, 1.2, 1.6, C.libWall);
    // Gable roof (approximated with a tall box + wedge feel via proportions)
    box(g, 0, 1.2, 0, 1.9, 0.6, 0.6, C.libRoof);   // ridge box
    box(g, 0, 1.2, 0.3, 1.9, 0.35, 0.95, C.libRoof);  // front slope
    box(g, 0, 1.2, -0.3, 1.9, 0.35, 0.95, C.libRoof); // back slope
    // Door
    box(g, 0, 0, 0.81, 0.4, 0.8, 0.06, C.libAccent);
    // Window
    box(g, 0.5, 0.65, 0.81, 0.4, 0.35, 0.06, C.libWindow);

    if (level >= 2) {
        // Wider building
        box(g, 0, 0, 0, 2.4, 1.5, 1.8, C.libWall);
        box(g, 0, 1.5, 0, 2.5, 0.6, 0.7, C.libRoof);
        box(g, 0, 1.5, 0.35, 2.5, 0.38, 1.1, C.libRoof);
        box(g, 0, 1.5, -0.35, 2.5, 0.38, 1.1, C.libRoof);
        // Columns
        box(g, -0.85, 0, 0.92, 0.2, 1.5, 0.2, C.libWall);
        box(g, 0.85, 0, 0.92, 0.2, 1.5, 0.2, C.libWall);
        // Extra windows
        box(g, -0.65, 0.7, 0.91, 0.38, 0.38, 0.06, C.libWindow);
        box(g, 0.65, 0.7, 0.91, 0.38, 0.38, 0.06, C.libWindow);
    }

    if (level >= 3) {
        // Grand archive tower centrepiece
        box(g, 0, 2.1, 0, 1.0, 1.0, 1.0, C.libWall);
        box(g, 0, 3.1, 0, 1.15, 0.35, 1.15, C.libRoof);
        // Glowing lantern
        glowOrb(g, 0, 3.55, 0, C.libWindow, 0.22);
        // Banner flags
        box(g, -1.25, 1.5, 0.93, 0.06, 0.8, 0.06, C.libAccent);
        box(g, -1.55, 2.1, 0.93, 0.55, 0.3, 0.06, C.libRoof,
            { emissive: C.libRoof, emissiveInt: 0.2 });
        box(g, 1.25, 1.5, 0.93, 0.06, 0.8, 0.06, C.libAccent);
        box(g, 1.55, 2.1, 0.93, 0.55, 0.3, 0.06, C.libRoof,
            { emissive: C.libRoof, emissiveInt: 0.2 });
    }

    addHitbox(g, 3.0, 3.8, 2.5, 0);
    return g;
}

// ─── KITCHEN / NUTRITION ─────────────────────────────────────────────────────

function buildNutrition(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.8, 2.0, 1.6);

    box(g, 0, 0, 0, 1.7, 1.1, 1.5, C.kitWall);
    // Gable roof
    box(g, 0, 1.1, 0, 1.8, 0.55, 0.55, C.kitRoof);
    box(g, 0, 1.1, 0.28, 1.8, 0.32, 0.88, C.kitRoof);
    box(g, 0, 1.1, -0.28, 1.8, 0.32, 0.88, C.kitRoof);
    // Door
    box(g, 0, 0, 0.76, 0.42, 0.78, 0.06, C.darkwood);
    // Chimney
    box(g, 0.45, 0.9, -0.35, 0.28, 0.7, 0.28, C.kitChimney);
    box(g, 0.45, 1.6, -0.35, 0.35, 0.12, 0.35, C.kitChimney);

    if (level >= 2) {
        box(g, 0, 0, 0, 2.3, 1.4, 1.8, C.kitWall);
        box(g, 0, 1.4, 0, 2.4, 0.55, 0.6, C.kitRoof);
        box(g, 0, 1.4, 0.3, 2.4, 0.33, 1.15, C.kitRoof);
        box(g, 0, 1.4, -0.3, 2.4, 0.33, 1.15, C.kitRoof);
        box(g, 0.6, 1.55, -0.35, 0.3, 0.9, 0.3, C.kitChimney);
        box(g, 0.6, 2.45, -0.35, 0.38, 0.13, 0.38, C.kitChimney);
        // Garden box in front
        box(g, -0.5, 0, 1.0, 0.7, 0.3, 0.4, C.kitAccent);
        box(g, -0.5, 0.32, 1.0, 0.6, 0.18, 0.32, 0x2E7D32);  // plant
        box(g, 0.4, 0, 1.0, 0.55, 0.3, 0.38, C.kitAccent);
        box(g, 0.4, 0.32, 1.0, 0.45, 0.2, 0.3, 0xE91E63);   // flower
        // Window
        box(g, 0.6, 0.7, 0.91, 0.45, 0.4, 0.06, 0xFFF8E1);
    }

    if (level >= 3) {
        // Outdoor seating awning
        box(g, 0, 0, 1.55, 2.5, 0.08, 1.0, C.kitRoof);
        box(g, -1.1, 0, 1.5, 0.1, 1.0, 0.1, C.darkwood);
        box(g, 1.1, 0, 1.5, 0.1, 1.0, 0.1, C.darkwood);
        // Glowing sign
        box(g, 0, 1.4, 0.92, 1.4, 0.3, 0.08, C.kitRoof,
            { emissive: C.kitRoof, emissiveInt: 0.5 });
        // Smoke puffs (static orbs above chimney)
        glowOrb(g, 0.6, 2.7, -0.35, C.white, 0.15);
        glowOrb(g, 0.55, 3.0, -0.3, C.white, 0.1);
    }

    addHitbox(g, 3.5, 3.0, 3.5, 0);
    return g;
}

// ─── SLEEP / REST HOUSE ───────────────────────────────────────────────────────

function buildSleep(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.8, 2.2, 1.6);

    box(g, 0, 0, 0, 1.6, 1.1, 1.5, C.sleepWall);
    box(g, 0, 1.1, 0, 1.8, 0.6, 0.6, C.sleepRoof);
    box(g, 0, 1.1, 0.3, 1.8, 0.35, 0.95, C.sleepRoof);
    box(g, 0, 1.1, -0.3, 1.8, 0.35, 0.95, C.sleepRoof);
    // Door
    box(g, 0, 0, 0.76, 0.4, 0.75, 0.06, 0x4A148C);
    // Moon window
    box(g, 0, 0.7, 0.76, 0.4, 0.4, 0.06, C.sleepMoon);

    if (level >= 2) {
        box(g, 0, 0, 0, 2.0, 1.35, 1.7, C.sleepWall);
        // Porch cover
        box(g, 0, 1.35, 0.95, 1.8, 0.1, 0.55, C.sleepRoof);
        box(g, -0.75, 0, 0.88, 0.12, 1.35, 0.12, C.sleepWall);
        box(g, 0.75, 0, 0.88, 0.12, 1.35, 0.12, C.sleepWall);
        // Stars decoration
        glowOrb(g, -0.7, 1.6, 0, C.sleepMoon, 0.1);
        glowOrb(g, 0.7, 1.7, 0, C.sleepMoon, 0.08);
        glowOrb(g, 0, 1.55, -0.65, C.sleepMoon, 0.09);
        // Chimneys
        box(g, 0.55, 1.2, -0.45, 0.22, 0.55, 0.22, C.sleepRoof);
    }

    if (level >= 3) {
        // Tower extension
        box(g, 0, 1.45, 0, 1.1, 1.0, 1.1, C.sleepWall);
        box(g, 0, 2.45, 0, 1.3, 0.4, 1.3, C.sleepRoof);
        // Crescent on tower
        glowOrb(g, 0, 2.9, 0, 0xCE93D8, 0.25);
        // Glow border on porch roof
        box(g, 0, 1.35, 0.95, 1.82, 0.06, 0.56, C.sleepRoof,
            { emissive: 0x7E57C2, emissiveInt: 0.6 });
        // Window lights
        glowOrb(g, 0.4, 0.8, 1.02, 0xE1BEE7, 0.1);
        glowOrb(g, -0.4, 0.8, 1.02, 0xE1BEE7, 0.1);
    }

    addHitbox(g, 2.8, 3.5, 2.8, 0);
    return g;
}

// ─── HYDRATION / WELL ────────────────────────────────────────────────────────

function buildHydration(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.2, 1.5, 1.2);

    // Level 1 — stone well
    // Well body (hollow-ish with 4 side boxes)
    for (const [ox, oz, ww, dd] of [
        [0, 0.45, 1.0, 0.12],
        [0, -0.45, 1.0, 0.12],
        [0.45, 0, 0.12, 1.0],
        [-0.45, 0, 0.12, 1.0],
    ] as [number, number, number, number][]) {
        box(g, ox, 0, oz, ww, 0.7, dd, C.wellStone);
    }
    // Rim cap
    box(g, 0, 0.7, 0, 1.05, 0.1, 1.05, C.darkstone);
    // Water inside
    box(g, 0, 0.3, 0, 0.72, 0.2, 0.72, C.wellWater, { emissive: C.wellWater, emissiveInt: 0.3 });
    // Wooden cross-beam
    box(g, 0, 1.05, 0, 1.1, 0.1, 0.1, C.darkwood);
    box(g, 0, 1.05, 0, 0.1, 0.1, 1.1, C.darkwood);
    // Support poles
    box(g, 0, 0.7, 0.5, 0.08, 0.5, 0.08, C.darkwood);
    box(g, 0, 0.7, -0.5, 0.08, 0.5, 0.08, C.darkwood);
    // Mini roof over well
    box(g, 0, 1.2, 0, 1.15, 0.08, 0.35, C.wellRoof);
    box(g, 0, 1.2, 0, 0.35, 0.08, 1.15, C.wellRoof);

    if (level >= 2) {
        // Fountain — tiered basins
        box(g, 0, 0.5, 0, 1.8, 0.12, 1.8, C.wellStone);     // lower basin rim
        box(g, 0, 0.62, 0, 1.6, 0.25, 1.6, C.stone);          // lower basin walls
        box(g, 0, 0.25, 0, 1.65, 0.3, 1.65, C.wellWater,
            { emissive: C.wellWater, emissiveInt: 0.3 });       // lower water
        // Centre pillar
        box(g, 0, 0.5, 0, 0.4, 1.0, 0.4, C.wellStone);
        // Upper basin
        box(g, 0, 1.5, 0, 1.1, 0.1, 1.1, C.wellStone);
        box(g, 0, 1.6, 0, 1.0, 0.2, 1.0, C.stone);
        box(g, 0, 1.55, 0, 0.85, 0.22, 0.85, C.wellWater,
            { emissive: C.wellWater, emissiveInt: 0.4 });
        // Spout
        box(g, 0, 1.8, 0, 0.15, 0.6, 0.15, C.wellStone);
        glowOrb(g, 0, 2.45, 0, C.wellWater, 0.16);
    }

    if (level >= 3) {
        // Crystal spring — glowing upgrade
        box(g, 0, 0.25, 0, 2.1, 0.25, 2.1, 0x80DEEA,
            { emissive: 0x80DEEA, emissiveInt: 0.5 });
        box(g, 0, 0.5, 0, 2.3, 0.15, 2.3, C.white);
        // Crystal spire
        box(g, 0, 1.8, 0, 0.3, 1.2, 0.3, 0x80DEEA,
            { emissive: 0x80DEEA, emissiveInt: 0.6 });
        glowOrb(g, 0, 3.1, 0, 0x29B6F6, 0.3);
        // Ring of orbs
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            glowOrb(g, Math.cos(angle) * 1.2, 0.55, Math.sin(angle) * 1.2, 0x29B6F6, 0.1);
        }
    }

    addHitbox(g, 2.5, 3.5, 2.5, 0);
    return g;
}

// ─── CLOCK TOWER / PRODUCTIVITY ──────────────────────────────────────────────

function buildProductivity(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.0, 3.5, 1.0);

    // Level 1 — short sundial tower
    box(g, 0, 0, 0, 1.1, 0.3, 1.1, C.clockWall);   // base plinth
    box(g, 0, 0.3, 0, 0.85, 1.8, 0.85, C.clockWall); // shaft
    box(g, 0, 2.1, 0, 1.0, 0.2, 1.0, C.clockRoof);   // cap
    // Sundial flat top
    box(g, 0, 2.3, 0, 0.7, 0.08, 0.7, C.stone);
    box(g, 0, 2.4, 0.1, 0.08, 0.4, 0.08, C.clockHand); // gnomon

    if (level >= 2) {
        // Taller clock tower
        box(g, 0, 0, 0, 1.2, 0.4, 1.2, C.clockWall);
        box(g, 0, 0.4, 0, 0.9, 2.6, 0.9, C.clockWall);
        box(g, 0, 3.0, 0, 1.15, 0.35, 1.15, C.clockRoof); // clock floor
        // Clock face on each side
        box(g, 0, 3.18, 0.59, 0.7, 0.7, 0.05, C.clockFace);
        box(g, 0, 3.18, -0.59, 0.7, 0.7, 0.05, C.clockFace);
        box(g, 0.59, 3.18, 0, 0.05, 0.7, 0.7, C.clockFace);
        box(g, -0.59, 3.18, 0, 0.05, 0.7, 0.7, C.clockFace);
        // Clock hands (gold)
        box(g, 0, 3.35, 0.6, 0.06, 0.25, 0.04, C.clockHand);
        box(g, 0.1, 3.22, 0.6, 0.2, 0.04, 0.04, C.clockHand);
        // Pointy roof
        box(g, 0, 3.35, 0, 1.2, 0.15, 1.2, C.clockRoof);
        box(g, 0, 3.5, 0, 0.9, 0.2, 0.9, C.clockRoof);
        box(g, 0, 3.7, 0, 0.6, 0.3, 0.6, C.clockRoof);
        box(g, 0, 4.0, 0, 0.22, 0.5, 0.22, C.clockRoof);
    }

    if (level >= 3) {
        // Bell chamber
        box(g, 0, 4.5, 0, 1.0, 0.6, 1.0, C.clockWall);
        box(g, 0, 5.1, 0, 1.15, 0.25, 1.15, C.clockRoof);
        // Glowing clock faces
        box(g, 0, 3.18, 0.59, 0.72, 0.72, 0.05, C.clockFace,
            { emissive: C.clockHand, emissiveInt: 0.4 });
        // Spire
        box(g, 0, 5.35, 0, 0.18, 0.9, 0.18, C.clockHand,
            { emissive: C.clockHand, emissiveInt: 0.5 });
        glowOrb(g, 0, 6.3, 0, C.clockHand, 0.2);
        // Bell
        box(g, 0, 4.7, 0, 0.35, 0.3, 0.35, C.gold,
            { emissive: C.gold, emissiveInt: 0.3 });
    }

    addHitbox(g, 2.0, 6.5, 2.0, 0);
    return g;
}

// ─── BOOKSHOP / JOURNAL ───────────────────────────────────────────────────────

function buildJournal(level: number): THREE.Group {
    const g = new THREE.Group();
    if (level === 0) return buildLocked(1.8, 2.0, 1.6);

    // Level 1 — cosy townhouse
    box(g, 0, 0, 0, 1.7, 1.2, 1.5, C.bookWall);
    // Steep gable
    box(g, 0, 1.2, 0, 1.8, 0.65, 0.55, C.bookRoof);
    box(g, 0, 1.2, 0.28, 1.8, 0.38, 0.9, C.bookRoof);
    box(g, 0, 1.2, -0.28, 1.8, 0.38, 0.9, C.bookRoof);
    // Door
    box(g, -0.3, 0, 0.76, 0.4, 0.8, 0.06, C.darkwood);
    // Window with shutter vibe
    box(g, 0.45, 0.65, 0.76, 0.4, 0.38, 0.06, C.bookLamp);
    // Lamp post
    box(g, 0.85, 0, 0.7, 0.07, 1.2, 0.07, C.darkwood);
    glowOrb(g, 0.85, 1.3, 0.7, C.bookLamp, 0.15);

    if (level >= 2) {
        box(g, 0, 0, 0, 2.2, 1.55, 1.8, C.bookWall);
        // Bay window bump-out on front
        box(g, 0.5, 0.3, 0.98, 0.7, 0.85, 0.22, C.bookWall);
        box(g, 0.5, 1.15, 0.98, 0.75, 0.12, 0.25, C.bookRoof);
        // Bay window panes
        box(g, 0.5, 0.7, 1.1, 0.55, 0.5, 0.05, C.bookLamp);
        // Book sign on front
        box(g, -0.4, 1.05, 0.92, 0.9, 0.28, 0.07, C.bookRoof,
            { emissive: C.bookRoof, emissiveInt: 0.2 });
        // Second lamp
        box(g, -1.1, 0, 0.7, 0.07, 1.3, 0.07, C.darkwood);
        glowOrb(g, -1.1, 1.4, 0.7, C.bookLamp, 0.14);
    }

    if (level >= 3) {
        // Grand facade extension
        box(g, 0, 1.55, 0, 2.3, 0.8, 0.9, C.bookWall);
        box(g, 0, 2.35, 0, 2.4, 0.55, 0.55, C.bookRoof);
        box(g, 0, 2.35, 0.28, 2.4, 0.32, 0.9, C.bookRoof);
        // University sign (glowing)
        box(g, 0, 1.75, 0.93, 1.8, 0.32, 0.08, C.bookLamp,
            { emissive: C.bookLamp, emissiveInt: 0.6 });
        // Flagpole
        box(g, 1.1, 2.35, 0, 0.07, 1.1, 0.07, C.darkwood);
        box(g, 1.45, 3.0, 0, 0.6, 0.3, 0.07, C.bookRoof,
            { emissive: C.bookRoof, emissiveInt: 0.3 });
        // Glow lamps either side of door
        glowOrb(g, -0.55, 1.0, 0.93, C.bookLamp, 0.12);
        glowOrb(g, 0.55, 1.0, 0.93, C.bookLamp, 0.12);
    }

    addHitbox(g, 3.0, 3.5, 3.0, 0);
    return g;
}

// ─── Public API ──────────────────────────────────────────────────────────────

const BUILDERS: Record<string, (level: number) => THREE.Group> = {
    meditation:  buildMeditation,
    gym:         buildGym,
    reading:     buildLibrary,
    nutrition:   buildNutrition,
    sleep:       buildSleep,
    hydration:   buildHydration,
    productivity: buildProductivity,
    journal:     buildJournal,
};

/**
 * Create the mesh group for a building.
 * The group is positioned at origin; the caller sets world position.
 * `group.userData.habitType` is set so raycasting can identify it.
 */
export function createBuildingGroup(habitType: string, level: number): THREE.Group {
    const builder = BUILDERS[habitType];
    const group = builder ? builder(level) : buildLocked(1.5, 2, 1.5);
    group.name = `building_${habitType}`;
    group.userData.habitType = habitType;
    return group;
}
