import * as THREE from 'three';

// Shared 3-step cel-shade gradient map (created once, reused for every building)
let _gradientMap: THREE.DataTexture | null = null;

export function getGradientMap(): THREE.DataTexture {
    if (!_gradientMap) {
        // 3 luminance steps: deep shadow → mid-tone → highlight
        const data = new Uint8Array([40, 40, 40, 255, 170, 170, 170, 255, 255, 255, 255, 255]);
        _gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
        _gradientMap.magFilter = THREE.NearestFilter;
        _gradientMap.minFilter = THREE.NearestFilter;
        _gradientMap.needsUpdate = true;
    }
    return _gradientMap;
}

/** Factory for a toon material with the shared gradient map. */
export function toon(
    color: THREE.ColorRepresentation,
    opts: { emissive?: THREE.ColorRepresentation; emissiveIntensity?: number } = {},
): THREE.MeshToonMaterial {
    return new THREE.MeshToonMaterial({
        color: new THREE.Color(color),
        gradientMap: getGradientMap(),
        emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
        emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
}

export function disposeSharedMaterials(): void {
    if (_gradientMap) {
        _gradientMap.dispose();
        _gradientMap = null;
    }
}
