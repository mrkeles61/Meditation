import type { BuildingDefinition } from '../types/town.types';

/**
 * Village layout (isometric diamond, Y increases toward viewer):
 *
 *           [Clock Tower]        ← back-center, tallest
 *      [Library]     [Rest House] ← outer back ring
 *         [Zen Temple]            ← center (largest)
 *    [Gym]         [Garden Kitchen]  ← inner ring
 *         [Well]                  ← front-center (small)
 *                     [Bookshop]  ← front-right
 *
 * All x/y are normalized 0–1 within the screen.
 * Scale decreases for buildings higher up (further back).
 */
export const BUILDING_REGISTRY: Record<string, BuildingDefinition> = {
    meditation: {
        id: 'meditation',
        habitType: 'meditation',
        name: 'Zen Temple',
        description: 'A peaceful temple for daily meditation',
        position: { x: 0.50, y: 0.40, scale: 1.1 }, // center diamond — largest
        baseWidth: 140,
        baseHeight: 180,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Meditation Hut', primaryColor: '#D4C5A9', accentColor: '#8B5E3C', roofColor: '#7a3a2a', features: ['door', 'window'] },
            { level: 2, label: 'Zen Temple', primaryColor: '#E8DCC8', accentColor: '#C0392B', roofColor: '#922B21', features: ['door', 'window', 'incense'] },
            { level: 3, label: 'Grand Pagoda', primaryColor: '#E8DCC8', accentColor: '#C0392B', roofColor: '#922B21', features: ['door', 'window', 'incense', 'bell', 'glow'] },
        ],
    },
    gym: {
        id: 'gym',
        habitType: 'gym',
        name: 'Fitness Center',
        description: 'Train your body and build strength',
        position: { x: 0.28, y: 0.56, scale: 1.0 }, // inner ring, front-left
        baseWidth: 130,
        baseHeight: 160,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Small Gym', primaryColor: '#D4C5A9', accentColor: '#6B4226', roofColor: '#B71C1C', features: ['door', 'window'] },
            { level: 2, label: 'Fitness Center', primaryColor: '#D4C5A9', accentColor: '#8B5E3C', roofColor: '#D32F2F', features: ['door', 'window', 'sign'] },
            { level: 3, label: 'Elite Gym', primaryColor: '#E8DCC8', accentColor: '#A0522D', roofColor: '#E53935', features: ['door', 'window', 'sign', 'flag', 'glow'] },
        ],
    },
    reading: {
        id: 'reading',
        habitType: 'reading',
        name: 'Library',
        description: 'Read daily to grow your mind',
        position: { x: 0.22, y: 0.30, scale: 0.80 }, // outer back-left
        baseWidth: 120,
        baseHeight: 150,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Book Stand', primaryColor: '#8B7355', accentColor: '#5D4037', roofColor: '#2E7D32', features: ['door'] },
            { level: 2, label: 'Library', primaryColor: '#A08B6A', accentColor: '#6D4C41', roofColor: '#388E3C', features: ['door', 'window', 'books'] },
            { level: 3, label: 'Grand Archive', primaryColor: '#B09A7A', accentColor: '#795548', roofColor: '#43A047', features: ['door', 'window', 'books', 'glow'] },
        ],
    },
    nutrition: {
        id: 'nutrition',
        habitType: 'nutrition',
        name: 'Garden Kitchen',
        description: 'Eat well and track your meals',
        position: { x: 0.70, y: 0.53, scale: 0.95 }, // inner ring, front-right
        baseWidth: 130,
        baseHeight: 155,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Food Cart', primaryColor: '#E8DCC8', accentColor: '#5D4037', roofColor: '#F5F5F5', features: ['door'] },
            { level: 2, label: 'Kitchen', primaryColor: '#E8DCC8', accentColor: '#6D4C41', roofColor: '#F5F5F5', features: ['door', 'window', 'chimney'] },
            { level: 3, label: 'Restaurant', primaryColor: '#E8DCC8', accentColor: '#795548', roofColor: '#FAFAFA', features: ['door', 'window', 'chimney', 'garden', 'glow'] },
        ],
    },
    sleep: {
        id: 'sleep',
        habitType: 'sleep',
        name: 'Rest House',
        description: 'Track sleep for better recovery',
        position: { x: 0.78, y: 0.30, scale: 0.80 }, // outer back-right
        baseWidth: 120,
        baseHeight: 150,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Cot', primaryColor: '#D4C5A9', accentColor: '#4A148C', roofColor: '#1A237E', features: ['door'] },
            { level: 2, label: 'Bedroom', primaryColor: '#D4C5A9', accentColor: '#6A1B9A', roofColor: '#283593', features: ['door', 'window', 'moon'] },
            { level: 3, label: 'Dream Palace', primaryColor: '#E8DCC8', accentColor: '#7B1FA2', roofColor: '#303F9F', features: ['door', 'window', 'moon', 'zzz', 'glow'] },
        ],
    },
    hydration: {
        id: 'hydration',
        habitType: 'hydration',
        name: 'The Well',
        description: 'Stay hydrated throughout the day',
        position: { x: 0.50, y: 0.65, scale: 0.85 }, // front center, small well
        baseWidth: 80,
        baseHeight: 90,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Stone Well', primaryColor: '#9E9E9E', accentColor: '#757575', roofColor: '#5D4037', features: [] },
            { level: 2, label: 'Fountain', primaryColor: '#BDBDBD', accentColor: '#9E9E9E', roofColor: '#795548', features: ['water'] },
            { level: 3, label: 'Crystal Spring', primaryColor: '#E0E0E0', accentColor: '#BDBDBD', roofColor: '#8D6E63', features: ['water', 'glow'] },
        ],
    },
    productivity: {
        id: 'productivity',
        habitType: 'productivity',
        name: 'Clock Tower',
        description: 'Focus and manage your time wisely',
        position: { x: 0.50, y: 0.21, scale: 0.75 }, // outer back-center, tallest structure
        baseWidth: 90,
        baseHeight: 220,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Sundial', primaryColor: '#757575', accentColor: '#616161', roofColor: '#424242', features: [] },
            { level: 2, label: 'Clock Tower', primaryColor: '#9E9E9E', accentColor: '#757575', roofColor: '#616161', features: ['clock', 'window'] },
            { level: 3, label: 'Grand Clock', primaryColor: '#BDBDBD', accentColor: '#9E9E9E', roofColor: '#757575', features: ['clock', 'window', 'chime', 'glow'] },
        ],
    },
    journal: {
        id: 'journal',
        habitType: 'journal',
        name: 'Bookshop',
        description: 'Write daily reflections and gratitude',
        position: { x: 0.76, y: 0.63, scale: 0.90 }, // front far-right
        baseWidth: 120,
        baseHeight: 150,
        levels: [
            { level: 0, label: 'Construction Site', primaryColor: '#454550', accentColor: '#3a3a42', roofColor: '#3a3a42', features: [] },
            { level: 1, label: 'Book Cart', primaryColor: '#8B7355', accentColor: '#5D4037', roofColor: '#7B1A1A', features: ['door'] },
            { level: 2, label: 'Bookshop', primaryColor: '#A08B6A', accentColor: '#6D4C41', roofColor: '#8B1A1A', features: ['door', 'window', 'lamp'] },
            { level: 3, label: 'University', primaryColor: '#B09A7A', accentColor: '#795548', roofColor: '#9B2020', features: ['door', 'window', 'lamp', 'flag', 'glow'] },
        ],
    },
};

export function getBuildingDef(habitType: string): BuildingDefinition | undefined {
    return BUILDING_REGISTRY[habitType];
}
