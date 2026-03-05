import type { NPCRoute } from '../types/town.types';

export const NPC_ROUTES: NPCRoute[] = [
    {
        id: 'npc_1',
        color: '#FFB347',
        speed: 0.4,
        points: [
            { x: 0.25, y: 0.65, scale: 1 },
            { x: 0.35, y: 0.55, scale: 1 },
            { x: 0.50, y: 0.48, scale: 1 },
            { x: 0.35, y: 0.40, scale: 1 },
            { x: 0.20, y: 0.35, scale: 1 },
        ],
    },
    {
        id: 'npc_2',
        color: '#4FC3F7',
        speed: 0.35,
        points: [
            { x: 0.48, y: 0.72, scale: 1 },
            { x: 0.55, y: 0.68, scale: 1 },
            { x: 0.52, y: 0.62, scale: 1 },
            { x: 0.45, y: 0.66, scale: 1 },
        ],
    },
    {
        id: 'npc_3',
        color: '#FF7043',
        speed: 0.3,
        points: [
            { x: 0.75, y: 0.52, scale: 1 },
            { x: 0.78, y: 0.42, scale: 1 },
            { x: 0.80, y: 0.38, scale: 1 },
            { x: 0.75, y: 0.48, scale: 1 },
        ],
    },
    {
        id: 'npc_4',
        color: '#AB47BC',
        speed: 0.25,
        points: [
            { x: 0.45, y: 0.30, scale: 1 },
            { x: 0.50, y: 0.28, scale: 1 },
            { x: 0.55, y: 0.32, scale: 1 },
            { x: 0.50, y: 0.35, scale: 1 },
        ],
    },
    {
        id: 'npc_5',
        color: '#66BB6A',
        speed: 0.3,
        points: [
            { x: 0.72, y: 0.62, scale: 1 },
            { x: 0.55, y: 0.55, scale: 1 },
            { x: 0.20, y: 0.33, scale: 1 },
            { x: 0.55, y: 0.55, scale: 1 },
        ],
    },
];
