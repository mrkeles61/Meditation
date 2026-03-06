/**
 * Building sprite manifest.
 * Maps habitType → level → public asset path.
 * Missing entries fall back to programmatic Graphics rendering.
 */
export const BUILDING_SPRITES: Record<string, Record<number, string>> = {
    meditation: {
        1: '/assets/buildings/meditation.png',
        2: '/assets/buildings/meditation.png',
        3: '/assets/buildings/meditation.png',
    },
    gym: {
        1: '/assets/buildings/gym.jpg',
        2: '/buildings/gym-level-2.png',
        3: '/buildings/gym-level-2.png',
    },
    // reading, nutrition, sleep, hydration, productivity, journal:
    // no sprites yet — all fall back to isometric Graphics
};
