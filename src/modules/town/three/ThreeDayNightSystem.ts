import * as THREE from 'three';

interface DayPhase {
    sunColor:     THREE.Color;
    sunIntensity: number;
    sunPos:       THREE.Vector3;
    ambientColor: THREE.Color;
    ambientInt:   number;
    fogColor:     THREE.Color;
    bgColor:      string;  // CSS color for the canvas background
}

const PHASES: Record<'day' | 'sunset' | 'night' | 'dawn', DayPhase> = {
    day: {
        sunColor:     new THREE.Color(0xFFF8E1),
        sunIntensity: 2.2,
        sunPos:       new THREE.Vector3(12, 20, 10),
        ambientColor: new THREE.Color(0xB3D9FF),
        ambientInt:   0.7,
        fogColor:     new THREE.Color(0xB3D9FF),
        bgColor:      '#87CEEB',
    },
    sunset: {
        sunColor:     new THREE.Color(0xFF7043),
        sunIntensity: 1.4,
        sunPos:       new THREE.Vector3(20, 4, 5),
        ambientColor: new THREE.Color(0xFF8A65),
        ambientInt:   0.55,
        fogColor:     new THREE.Color(0xFF7043),
        bgColor:      '#FF6F00',
    },
    night: {
        sunColor:     new THREE.Color(0x3949AB),
        sunIntensity: 0.4,
        sunPos:       new THREE.Vector3(0, 18, -12),
        ambientColor: new THREE.Color(0x1A237E),
        ambientInt:   0.5,
        fogColor:     new THREE.Color(0x0D1B3E),
        bgColor:      '#0a0a1e',
    },
    dawn: {
        sunColor:     new THREE.Color(0xFFCC80),
        sunIntensity: 1.0,
        sunPos:       new THREE.Vector3(-14, 7, 10),
        ambientColor: new THREE.Color(0xFFAB91),
        ambientInt:   0.45,
        fogColor:     new THREE.Color(0xFF8A65),
        bgColor:      '#FF5722',
    },
};

export type TimeOfDay = 'day' | 'sunset' | 'night' | 'dawn';

export class ThreeDayNightSystem {
    private sun: THREE.DirectionalLight;
    private ambient: THREE.AmbientLight;
    private scene: THREE.Scene;
    private currentPhase: TimeOfDay = 'day';

    constructor(scene: THREE.Scene, sun: THREE.DirectionalLight, ambient: THREE.AmbientLight) {
        this.scene = scene;
        this.sun = sun;
        this.ambient = ambient;
    }

    /** Returns the current time-of-day phase based on wall clock. */
    static getPhase(): TimeOfDay {
        const h = new Date().getHours() + new Date().getMinutes() / 60;
        if (h >= 6 && h < 18)  return 'day';
        if (h >= 18 && h < 20) return 'sunset';
        if (h >= 5 && h < 6)   return 'dawn';
        return 'night';
    }

    get phase(): TimeOfDay { return this.currentPhase; }

    /** Apply the current time-of-day lighting.  Call once on init, then ~every 60s. */
    update(): void {
        const phase = ThreeDayNightSystem.getPhase();
        this.currentPhase = phase;
        const p = PHASES[phase];

        this.sun.color.copy(p.sunColor);
        this.sun.intensity = p.sunIntensity;
        this.sun.position.copy(p.sunPos);
        this.sun.target.position.set(0, 0, 0);

        this.ambient.color.copy(p.ambientColor);
        this.ambient.intensity = p.ambientInt;

        this.scene.fog = new THREE.Fog(p.fogColor, 30, 90);
        this.scene.background = new THREE.Color(p.fogColor);
    }

    destroy(): void { /* nothing to clean up */ }
}
