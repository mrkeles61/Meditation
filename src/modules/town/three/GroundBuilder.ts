import * as THREE from 'three';
import { PATH_CONTROL_POINTS, POND_POSITION, TREE_POSITIONS } from '../data/scene-layout';

/** World-space extent of the scene (used for coordinate mapping too) */
export const WORLD_SIZE = 18;

/** Map normalised [0,1] scene coords → Three.js world XZ. */
export function normToWorld(nx: number, ny: number): { x: number; z: number } {
    return {
        x: (nx - 0.5) * WORLD_SIZE,
        z: (ny - 0.5) * WORLD_SIZE,
    };
}

export function buildGround(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ground';

    // ── Island base (large oval green plane) ──
    const islandGeo = new THREE.CircleGeometry(11, 48);
    const islandMat = new THREE.MeshLambertMaterial({ color: 0x5AAE47 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.rotation.x = -Math.PI / 2;
    island.receiveShadow = true;
    group.add(island);

    // ── Inner lighter grass patch (depth variation) ──
    const innerGeo = new THREE.CircleGeometry(8, 48);
    const innerMat = new THREE.MeshLambertMaterial({ color: 0x67C254 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.005;
    inner.receiveShadow = true;
    group.add(inner);

    // ── Sandy path connecting buildings ──
    const pathGroup = buildPath();
    group.add(pathGroup);

    // ── Pond ──
    const pond = buildPond();
    group.add(pond);

    // ── Flower clusters ──
    const flowers = buildFlowers();
    group.add(flowers);

    // ── Tree stumps at edges ──
    const trees = buildTrees();
    group.add(trees);

    return group;
}

function buildPath(): THREE.Group {
    const group = new THREE.Group();
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xC4A882 });
    const innerSandMat = new THREE.MeshLambertMaterial({ color: 0xD4BC99 });

    const points = PATH_CONTROL_POINTS.map(p => {
        const w = normToWorld(p.x, p.y);
        return new THREE.Vector3(w.x, 0.01, w.z);
    });

    // Draw path as a series of flattened boxes between consecutive waypoints
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.sqrt(dx * dx + dz * dz) + 0.3;
        const angle = Math.atan2(dx, dz);

        // Outer sandy strip
        const outerGeo = new THREE.BoxGeometry(0.9, 0.02, len);
        const outer = new THREE.Mesh(outerGeo, sandMat);
        outer.position.set((a.x + b.x) / 2, 0.01, (a.z + b.z) / 2);
        outer.rotation.y = angle;
        outer.receiveShadow = true;
        group.add(outer);

        // Inner lighter centerline
        const innerGeo = new THREE.BoxGeometry(0.5, 0.02, len);
        const innerMesh = new THREE.Mesh(innerGeo, innerSandMat);
        innerMesh.position.set((a.x + b.x) / 2, 0.012, (a.z + b.z) / 2);
        innerMesh.rotation.y = angle;
        group.add(innerMesh);
    }

    return group;
}

function buildPond(): THREE.Group {
    const group = new THREE.Group();
    const { x, z } = normToWorld(POND_POSITION.x, POND_POSITION.y);

    // Bank
    const bankGeo = new THREE.CircleGeometry(1.3, 24);
    const bankMat = new THREE.MeshLambertMaterial({ color: 0x2E6B3E });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.rotation.x = -Math.PI / 2;
    bank.position.set(x, 0.01, z);
    group.add(bank);

    // Water surface
    const waterGeo = new THREE.CircleGeometry(1.0, 24);
    const waterMat = new THREE.MeshLambertMaterial({
        color: 0x2E86C1,
        transparent: true,
        opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.015, z);
    group.add(water);

    // Highlight sheen
    const sheenGeo = new THREE.CircleGeometry(0.4, 16);
    const sheenMat = new THREE.MeshBasicMaterial({
        color: 0x7FC4E8,
        transparent: true,
        opacity: 0.4,
    });
    const sheen = new THREE.Mesh(sheenGeo, sheenMat);
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.set(x - 0.2, 0.02, z - 0.15);
    group.add(sheen);

    return group;
}

function buildFlowers(): THREE.Group {
    const group = new THREE.Group();
    const colors = [0xFFB347, 0xFF6B6B, 0x9B59B6, 0xFFD700, 0xE91E63, 0xF39C12];

    const clusters = [
        { nx: 0.32, ny: 0.58 },
        { nx: 0.65, ny: 0.63 },
        { nx: 0.20, ny: 0.45 },
        { nx: 0.60, ny: 0.42 },
        { nx: 0.40, ny: 0.70 },
        { nx: 0.75, ny: 0.50 },
    ];

    // Deterministic pseudo-random using seeded values
    function seeded(seed: number, max: number) {
        return ((seed * 2654435761) >>> 0) % max;
    }

    clusters.forEach((c, ci) => {
        const { x, z } = normToWorld(c.nx, c.ny);
        for (let i = 0; i < 5; i++) {
            const ox = (seeded(ci * 17 + i * 3, 100) - 50) / 50 * 0.6;
            const oz = (seeded(ci * 13 + i * 7, 100) - 50) / 50 * 0.4;
            const color = colors[(ci + i) % colors.length];

            // Stem
            const stemGeo = new THREE.BoxGeometry(0.04, 0.18, 0.04);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0x27AE60 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.set(x + ox, 0.09, z + oz);
            group.add(stem);

            // Flower head
            const headGeo = new THREE.BoxGeometry(0.18, 0.1, 0.18);
            const headMat = new THREE.MeshLambertMaterial({ color });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.set(x + ox, 0.22, z + oz);
            group.add(head);
        }
    });

    return group;
}

function buildTrees(): THREE.Group {
    const group = new THREE.Group();

    TREE_POSITIONS.forEach((tp, i) => {
        const { x, z } = normToWorld(tp.x, tp.y);
        const scale = tp.scale;

        // Trunk
        const trunkGeo = new THREE.BoxGeometry(0.3 * scale, 0.8 * scale, 0.3 * scale);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5E3C });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 0.4 * scale, z);
        trunk.castShadow = true;
        group.add(trunk);

        // Foliage — 3 stacked cubes (voxel tree style)
        const leafColor = i % 2 === 0 ? 0x27AE60 : 0x2ECC71;
        const leafMat = new THREE.MeshLambertMaterial({ color: leafColor });

        [[0, 1.0, 1.4], [0, 1.5, 1.1], [0, 1.9, 0.8]].forEach(([, yOff, size]) => {
            const leafGeo = new THREE.BoxGeometry(size * scale, size * 0.7 * scale, size * scale);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(x, yOff * scale, z);
            leaf.castShadow = true;
            group.add(leaf);
        });
    });

    return group;
}
