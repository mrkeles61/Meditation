import type { NPCRoute } from '../types/town.types';

/**
 * NPC routes follow the sandy path control points in scene-layout.ts.
 * Each route is a subset of the path loop, so NPCs only walk on the path —
 * never through grass or buildings.
 *
 * Waypoints use the same normalized (0–1) coordinate system.
 * NPCSystem pauses NPCs 2–3 seconds at each waypoint.
 */
export const NPC_ROUTES: NPCRoute[] = [
    {
        // Route 1: South loop — well → gym → back to well
        id: 'npc_1',
        color: '#FFB347',
        speed: 0.38,
        points: [
            { x: 0.50, y: 0.65, scale: 1 }, // well
            { x: 0.32, y: 0.59, scale: 1 }, // toward gym
            { x: 0.28, y: 0.50, scale: 1 }, // gym
            { x: 0.32, y: 0.59, scale: 1 }, // back toward well
            { x: 0.50, y: 0.65, scale: 1 }, // well
            { x: 0.64, y: 0.66, scale: 1 }, // toward journal
        ],
    },
    {
        // Route 2: North arc — clock tower → sleep → nutrition
        id: 'npc_2',
        color: '#4FC3F7',
        speed: 0.32,
        points: [
            { x: 0.50, y: 0.23, scale: 1 }, // clock tower
            { x: 0.66, y: 0.25, scale: 1 }, // toward sleep
            { x: 0.78, y: 0.32, scale: 1 }, // sleep
            { x: 0.73, y: 0.46, scale: 1 }, // toward nutrition
            { x: 0.70, y: 0.55, scale: 1 }, // nutrition
            { x: 0.66, y: 0.25, scale: 1 }, // back north
        ],
    },
    {
        // Route 3: West arc — library → clock tower → back
        id: 'npc_3',
        color: '#FF7043',
        speed: 0.28,
        points: [
            { x: 0.22, y: 0.32, scale: 1 }, // library
            { x: 0.34, y: 0.25, scale: 1 }, // toward clock tower
            { x: 0.50, y: 0.23, scale: 1 }, // clock tower
            { x: 0.34, y: 0.25, scale: 1 }, // back toward library
            { x: 0.22, y: 0.32, scale: 1 }, // library
            { x: 0.24, y: 0.40, scale: 1 }, // south from library
        ],
    },
    {
        // Route 4: Journal → well → gym loop
        id: 'npc_4',
        color: '#AB47BC',
        speed: 0.25,
        points: [
            { x: 0.76, y: 0.63, scale: 1 }, // journal
            { x: 0.64, y: 0.66, scale: 1 }, // toward well
            { x: 0.50, y: 0.65, scale: 1 }, // well
            { x: 0.32, y: 0.59, scale: 1 }, // toward gym
            { x: 0.28, y: 0.50, scale: 1 }, // gym
            { x: 0.32, y: 0.59, scale: 1 }, // back toward well
        ],
    },
    {
        // Route 5: Full loop — gym → library → clock → sleep → journal
        id: 'npc_5',
        color: '#66BB6A',
        speed: 0.30,
        points: [
            { x: 0.28, y: 0.50, scale: 1 }, // gym
            { x: 0.24, y: 0.40, scale: 1 }, // gym → library path
            { x: 0.22, y: 0.32, scale: 1 }, // library
            { x: 0.34, y: 0.25, scale: 1 }, // library → clock
            { x: 0.50, y: 0.23, scale: 1 }, // clock tower
            { x: 0.66, y: 0.25, scale: 1 }, // clock → sleep
            { x: 0.78, y: 0.32, scale: 1 }, // sleep
            { x: 0.73, y: 0.46, scale: 1 }, // sleep → nutrition
            { x: 0.70, y: 0.55, scale: 1 }, // nutrition
            { x: 0.74, y: 0.63, scale: 1 }, // toward journal
        ],
    },
];
