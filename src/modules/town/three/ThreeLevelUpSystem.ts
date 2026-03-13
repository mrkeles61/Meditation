import * as THREE from 'three';

/**
 * ThreeLevelUpSystem — celebration when a building levels up.
 *
 * Uses a THREE.Points burst for sparkles (in-scene) plus fires a callback
 * so TownScene.tsx can show a React overlay for the text/flash (much simpler
 * than fighting Three.js text rendering).
 */
export class ThreeLevelUpSystem {
    private scene: THREE.Scene;
    private active = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /** Play the level-up animation.  Resolves when sparkles finish (~1.2s). */
    async play(
        worldPos: THREE.Vector3,
        onStart?: () => void,
    ): Promise<void> {
        if (this.active) return;
        this.active = true;
        onStart?.();

        await this.sparkles(worldPos);
        this.active = false;
    }

    private sparkles(pos: THREE.Vector3): Promise<void> {
        return new Promise((resolve) => {
            const count = 28;
            const positions = new Float32Array(count * 3);
            const velocities: THREE.Vector3[] = [];

            for (let i = 0; i < count; i++) {
                positions[i * 3]     = pos.x;
                positions[i * 3 + 1] = pos.y + 1.5;
                positions[i * 3 + 2] = pos.z;

                const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.5;
                const upward = 0.04 + Math.random() * 0.06;
                const out    = 0.03 + Math.random() * 0.06;
                velocities.push(new THREE.Vector3(
                    Math.cos(angle) * out,
                    upward,
                    Math.sin(angle) * out,
                ));
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            // Alternating gold / orange sparkles
            const colors = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const gold = i % 2 === 0;
                colors[i * 3]     = gold ? 1.0 : 1.0;
                colors[i * 3 + 1] = gold ? 0.85 : 0.5;
                colors[i * 3 + 2] = gold ? 0.0 : 0.0;
            }
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const mat = new THREE.PointsMaterial({
                size:            0.28,
                vertexColors:    true,
                transparent:     true,
                depthWrite:      false,
                sizeAttenuation: true,
            });
            const points = new THREE.Points(geo, mat);
            this.scene.add(points);

            const startTime = performance.now();
            const duration  = 1200;

            const animate = () => {
                const elapsed = performance.now() - startTime;
                const t       = elapsed / duration;

                if (t >= 1) {
                    this.scene.remove(points);
                    geo.dispose();
                    mat.dispose();
                    resolve();
                    return;
                }

                const pos = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3]     += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;
                    pos[i * 3 + 2] += velocities[i].z;
                    velocities[i].y -= 0.003; // gravity
                }
                geo.attributes.position.needsUpdate = true;
                mat.opacity = 1 - t * t;

                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        });
    }

    destroy(): void { /* nothing persistent */ }
}
