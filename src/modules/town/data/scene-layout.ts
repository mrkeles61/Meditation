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

export const TREE_POSITIONS: ScenePosition[] = [
    { x: 0.08, y: 0.28, scale: 0.8 },
    { x: 0.92, y: 0.32, scale: 0.75 },
    { x: 0.05, y: 0.55, scale: 0.9 },
    { x: 0.93, y: 0.58, scale: 0.85 },
    { x: 0.15, y: 0.75, scale: 1.0 },
    { x: 0.88, y: 0.72, scale: 0.95 },
];

export const POND_POSITION: ScenePosition = { x: 0.82, y: 0.68, scale: 1.0 };

export const PATH_CONTROL_POINTS = [
    { x: 0.15, y: 0.78 },
    { x: 0.30, y: 0.65 },
    { x: 0.50, y: 0.55 },
    { x: 0.50, y: 0.45 },
    { x: 0.35, y: 0.35 },
    { x: 0.50, y: 0.28 },
    { x: 0.65, y: 0.35 },
    { x: 0.75, y: 0.50 },
    { x: 0.72, y: 0.62 },
    { x: 0.55, y: 0.72 },
];
