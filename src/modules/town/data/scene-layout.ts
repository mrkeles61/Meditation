import type { ScenePosition } from '../types/town.types';

export const BASE_WIDTH = 390;
export const BASE_HEIGHT = 844;

export function getSceneScale(screenW: number, screenH: number): number {
    return Math.min(screenW / BASE_WIDTH, screenH / BASE_HEIGHT);
}

export function resolvePosition(pos: ScenePosition, sceneW: number, sceneH: number) {
    return {
        x: pos.x * sceneW,
        y: pos.y * sceneH,
        scale: pos.scale,
    };
}

/**
 * Trees at the diamond edges — natural borders for the village.
 * Paired left/right at three depth levels.
 */
export const TREE_POSITIONS: ScenePosition[] = [
    { x: 0.07, y: 0.28, scale: 0.75 }, // far back-left
    { x: 0.93, y: 0.28, scale: 0.72 }, // far back-right
    { x: 0.06, y: 0.50, scale: 0.88 }, // mid-left
    { x: 0.94, y: 0.50, scale: 0.84 }, // mid-right
    { x: 0.12, y: 0.74, scale: 1.00 }, // near front-left
    { x: 0.87, y: 0.72, scale: 0.96 }, // near front-right
];

/** Pond at front-right corner of the diamond */
export const POND_POSITION: ScenePosition = { x: 0.83, y: 0.73, scale: 1.0 };

/**
 * Sandy path control points — traces a loop connecting all buildings.
 * Matches the building positions in building-registry.ts:
 *   well(0.50,0.65) → gym(0.28,0.56) → library(0.22,0.30) →
 *   clock(0.50,0.21) → sleep(0.78,0.30) → nutrition(0.70,0.53) →
 *   journal(0.76,0.63) → back to well
 */
export const PATH_CONTROL_POINTS = [
    { x: 0.50, y: 0.65 }, // well — front center hub
    { x: 0.32, y: 0.59 }, // toward gym
    { x: 0.28, y: 0.50 }, // gym area
    { x: 0.24, y: 0.40 }, // gym → library path
    { x: 0.22, y: 0.32 }, // library
    { x: 0.34, y: 0.25 }, // library → clock tower
    { x: 0.50, y: 0.23 }, // clock tower
    { x: 0.66, y: 0.25 }, // clock tower → sleep
    { x: 0.78, y: 0.32 }, // sleep
    { x: 0.73, y: 0.46 }, // sleep → nutrition
    { x: 0.70, y: 0.55 }, // nutrition
    { x: 0.74, y: 0.63 }, // nutrition → journal
    { x: 0.76, y: 0.63 }, // journal
    { x: 0.64, y: 0.66 }, // journal → well
];
